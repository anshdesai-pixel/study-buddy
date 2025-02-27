/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  X,
  Search,
  Check,
  Sparkles,
  RefreshCw,
  Loader2,
  ArrowDown,
  AlertCircle,
} from "lucide-react";
import { CreateTaskInput } from "@/common/types/request/task.types";
import { createTaskAction } from "@/app/_actions/task.actions";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { generateSuggestions } from "@/lib/gemini";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateTaskForm = ({
  userId,
  allProjects,
}: {
  userId: string;
  allProjects: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
  }[];
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Project validation states
  const [projectValidationError, setProjectValidationError] = useState<
    string | null
  >(null);

  // AI suggestion states
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [descriptionSummary, setDescriptionSummary] = useState<string>("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] =
    useState<boolean>(false);
  const [showTitleSuggestions, setShowTitleSuggestions] =
    useState<boolean>(false);

  // Debounce timer for API calls
  const summaryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Selected project data
  const selectedProjectData = selectedProject
    ? allProjects.find((p) => p.id === selectedProject)
    : null;

  // Effect for validating project selection
  useEffect(() => {
    if (selectedProject && selectedProjectData) {
      const projectStartDate = new Date(selectedProjectData.start_date);
      const now = new Date();

      // Check if project's start date is in the future
      if (projectStartDate > now) {
        setProjectValidationError(
          `Project "${
            selectedProjectData.name
          }" has not started yet. It will start on ${projectStartDate.toLocaleDateString()}.`
        );
      } else {
        setProjectValidationError(null);
      }
    } else {
      setProjectValidationError(null);
    }
  }, [selectedProject, selectedProjectData]);

  // Update deadline max date based on project selection
  useEffect(() => {
    if (selectedProject && selectedProjectData) {
      // If the current deadline is beyond the project deadline, reset it
      const projectDeadline = new Date(selectedProjectData.deadline);
      if (deadline) {
        const taskDeadline = new Date(deadline + "Z");
        if (taskDeadline > projectDeadline) {
          setDeadline("");
        }
      }
    }
  }, [selectedProject, selectedProjectData, deadline]);

  // Clear summary timer on unmount
  useEffect(() => {
    return () => {
      if (summaryTimerRef.current) {
        clearTimeout(summaryTimerRef.current);
      }
    };
  }, []);

  // Count words in a string
  const countWords = (str: string) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  // Generate title suggestions
  async function generateTitleSuggestions() {
    if (!taskTitle.trim()) {
      toast.error("Please enter a title first");
      return;
    }

    setIsGeneratingTitle(true);
    setShowTitleSuggestions(true);
    try {
      const basePrompt = `Based on the task title "${taskTitle}", generate 3 alternative short, concise task title suggestions. Each suggestion should be no more than 3-4 words. Keep them clear, action-oriented, and professional. Directly give me the three alternative suggestions without saying here are 3 suggestions.`;

      const prompt = taskDescription
        ? `${basePrompt}. Context: ${taskDescription}. Make the suggestions different from but related to the original title.`
        : `${basePrompt}. Make the suggestions different from but related to the original title.`;

      const suggestions = await generateSuggestions(prompt);

      let parsedSuggestions = suggestions
        .split("\n")
        .map((s) =>
          s
            .replace(/^\d+\.\s*/, "")
            .replace(/^-\s*/, "")
            .trim()
        )
        .filter(Boolean)
        .filter((s) => s.toLowerCase() !== taskTitle.toLowerCase());

      // Ensure suggestions are unique
      parsedSuggestions = [...new Set(parsedSuggestions)];

      // Add fallbacks if needed
      while (parsedSuggestions.length < 3) {
        const fallbacks = [
          `Complete ${taskTitle}`,
          `${taskTitle} Task`,
          `${taskTitle} Priority`,
          `Finish ${taskTitle}`,
          `${taskTitle} Action`,
        ];

        for (const fallback of fallbacks) {
          if (
            !parsedSuggestions.includes(fallback) &&
            fallback.toLowerCase() !== taskTitle.toLowerCase() &&
            parsedSuggestions.length < 3
          ) {
            parsedSuggestions.push(fallback);
          }
        }
      }

      setTitleSuggestions(parsedSuggestions.slice(0, 3));
    } catch (error) {
      toast.error("Failed to generate title suggestions.");
      setTitleSuggestions([
        `Complete ${taskTitle}`,
        `${taskTitle} Task`,
        `${taskTitle} Priority`,
      ]);
    } finally {
      setIsGeneratingTitle(false);
    }
  }

  // Summarize description using AI
  async function summarizeDescription(description: string) {
    setTaskDescription(description);

    // Don't summarize if description is too short
    if (countWords(description) < 5) {
      setDescriptionSummary("");
      return;
    }

    // Clear previous timer if it exists
    if (summaryTimerRef.current) {
      clearTimeout(summaryTimerRef.current);
    }

    // Set a debounce timeout to avoid too many API calls
    summaryTimerRef.current = setTimeout(async () => {
      setIsGeneratingSummary(true);
      try {
        const prompt = `Here is the task description written by the user for certain task, summarize the following task description to make it clear: ${description}`;
        const summary = await generateSuggestions(prompt);
        setDescriptionSummary(summary.trim());
      } catch (error) {
        console.error("Failed to summarize:", error);
        setDescriptionSummary("");
      } finally {
        setIsGeneratingSummary(false);
      }
    }, 800); // 800ms debounce
  }

  // Apply the summary to the main description
  const applyDescriptionSummary = () => {
    if (descriptionSummary) {
      setTaskDescription(descriptionSummary);
      setDescriptionSummary("");
      toast.success("Description updated with summary");
    }
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const deadlineStr = formData.get("deadline") as string;
    const startDateStr = formData.get("start_date") as string;
    const title = taskTitle;
    const description = taskDescription || null;
    const projectId = selectedProject;

    const is_project_task = projectId !== null;

    // Parse dates
    const startDate = new Date(startDateStr + "Z");
    const deadline = new Date(deadlineStr + "Z");
    const now = new Date();

    if (startDate < now) {
      toast.error("Start date cannot be in the past");
      setIsLoading(false);
      return;
    }

    if (deadline < startDate) {
      toast.error("Deadline cannot be before the start date");
      setIsLoading(false);
      return;
    }

    // Project validation
    if (selectedProject && selectedProjectData) {
      const projectStartDate = new Date(selectedProjectData.start_date);
      const projectDeadline = new Date(selectedProjectData.deadline);

      // Check if project has started
      if (projectStartDate > now) {
        toast.error(
          `Cannot create task for project "${selectedProjectData.name}" as it has not started yet`
        );
        setIsLoading(false);
        return;
      }

      // Check if task deadline is after project deadline
      if (deadline > projectDeadline) {
        toast.error(
          `Task deadline cannot be after the project deadline (${projectDeadline.toLocaleDateString()})`
        );
        setIsLoading(false);
        return;
      }
    }

    const data: CreateTaskInput = {
      title,
      description,
      start_date: startDate.toISOString(),
      deadline: deadline.toISOString(),
      projectId: projectId,
      is_project_task,
      userId: userId,
    };

    if (!data.title || !data.deadline || !data.userId || !data.start_date) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createTaskAction(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Task created successfully");
        (event.target as HTMLFormElement).reset();
        setIsOpen(false);
        setStartDate("");
        setDeadline("");
        setSelectedProject(null);
        setTaskTitle("");
        setTaskDescription("");
        setTitleSuggestions([]);
        setDescriptionSummary("");
        setShowTitleSuggestions(false);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setStartDate("");
      setDeadline("");
      setSelectedProject(null);
      setIsLoading(false);
      setTaskTitle("");
      setTaskDescription("");
      setTitleSuggestions([]);
      setDescriptionSummary("");
      setShowTitleSuggestions(false);
      setProjectValidationError(null);
    }
    setIsOpen(open);
  };

  const now = new Date().toISOString().slice(0, 16);

  // Get project deadline as ISO string for max deadline date
  const maxDeadline = selectedProjectData
    ? new Date(selectedProjectData.deadline).toISOString().slice(0, 16)
    : null;

  const selectedProjectName = allProjects.find(
    (p) => p.id === selectedProject
  )?.name;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Create New Task
            <Tooltip>
              <TooltipTrigger asChild>
                <Sparkles className="ml-2 h-4 w-4 text-yellow-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>AI-powered suggestions available</p>
              </TooltipContent>
            </Tooltip>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center">
              Task Title
            </Label>
            <div className="flex gap-2">
              <Input
                id="title"
                name="title"
                placeholder="Task title"
                aria-label="Task title"
                maxLength={120}
                required
                disabled={isLoading}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="flex-1"
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateTitleSuggestions}
                    disabled={isGeneratingTitle || !taskTitle.trim()}
                    className="shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 hover:opacity-90"
                  >
                    {isGeneratingTitle ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate title suggestions</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {showTitleSuggestions && (
              <div className="relative max-h-40 overflow-y-auto max-w-[520px]">
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-black text-white hover:text-white hover:bg-indigo-800"
                    onClick={() => setShowTitleSuggestions(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Card className="border bg-gradient-to-r from-indigo-50 to-purple-50 dark:bg-gradient-to-r dark:from-indigo-900 dark:to-purple-900">
                  <CardContent className="p-2">
                    <p className="text-sm font-medium mb-2 flex items-center">
                      <Sparkles className="h-3 w-3 mr-2 text-indigo-600" />
                      Title Suggestions
                    </p>

                    {isGeneratingTitle ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-5 w-5 text-indigo-600 animate-spin mr-2" />
                        <span className="text-sm text-indigo-600">
                          {`Creating titles based on "${taskTitle}"...`}
                        </span>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {titleSuggestions.map((title, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start text-left h-auto py-2 hover:bg-indigo-100 hover:text-indigo-900 hover:border-indigo-300 transition-all"
                            onClick={() => {
                              setTaskTitle(title);
                              setShowTitleSuggestions(false);
                            }}
                          >
                            {title}
                          </Button>
                        ))}
                      </div>
                    )}

                    {!isGeneratingTitle && titleSuggestions.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs w-full text-indigo-600 dark:text-white dark:hover:text-indigo-800 hover:text-indigo-800 hover:bg-indigo-100"
                        onClick={generateTitleSuggestions}
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerate suggestions
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center">
              Description
              {isGeneratingSummary && (
                <Loader2 className="ml-2 h-3 w-3 animate-spin text-gray-400" />
              )}
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add description"
              aria-label="Add description"
              disabled={isLoading}
              value={taskDescription}
              onChange={(e) => summarizeDescription(e.target.value)}
              className="min-h-[100px] max-h-[200px] resize-y"
            />

            {descriptionSummary && (
              <Card className="border bg-gradient-to-r from-indigo-50 to-purple-50 dark:bg-gradient-to-r dark:from-indigo-900 dark:to-purple-900 max-h-40 overflow-y-auto max-w-[520px]">
                <CardContent className="p-2">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-white mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-blue-700 dark:text-white">
                          AI Summary
                        </p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-300 bg-blue-100"
                              onClick={applyDescriptionSummary}
                            >
                              <ArrowDown className="h-3 w-3 mr-1" />
                              Apply
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Replace description with this summary</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-blue-900 dark:text-white">
                        {descriptionSummary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-2">
            <Label>Project (Optional)</Label>
            <div className="flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedProject
                      ? selectedProjectName
                      : "Select project..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search projects..." />
                    <CommandEmpty>No projects found.</CommandEmpty>
                    <CommandGroup>
                      {allProjects.map((project) => (
                        <CommandItem
                          key={project.id}
                          onSelect={() => {
                            setSelectedProject(
                              selectedProject === project.id ? null : project.id
                            );
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProject === project.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {project.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedProject && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedProject(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {projectValidationError && (
              <Alert variant="destructive" className="mt-2 p-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 text-xs">
                  {projectValidationError}
                </AlertDescription>
              </Alert>
            )}

            {selectedProjectData && !projectValidationError && (
              <p className="text-xs text-gray-500 mt-1">
                Project timeframe:{" "}
                {new Date(selectedProjectData.start_date).toLocaleDateString()}{" "}
                - {new Date(selectedProjectData.deadline).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                type="datetime-local"
                id="start_date"
                name="start_date"
                aria-label="Start Date"
                min={now}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                type="datetime-local"
                id="deadline"
                name="deadline"
                aria-label="Deadline"
                min={startDate || now}
                max={maxDeadline || undefined}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                disabled={isLoading}
              />
              {selectedProjectData && (
                <p className="text-xs text-gray-500">
                  Cannot be later than project deadline
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              type="button"
              aria-label="Cancel Button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              aria-label="Submit Button"
              disabled={
                isLoading || (!!projectValidationError && !!selectedProject)
              }
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create Task</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskForm;
