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
  Check,
  Plus,
  Search,
  X,
  Sparkles,
  RefreshCw,
  Loader2,
  ArrowDown,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { CreateProjectInput } from "@/common/types/request/project.types";
import { createProjectAction } from "@/app/_actions/project.actions";
import { addProjectMemberAction } from "@/app/_actions/project-member.actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { generateSuggestions } from "@/lib/gemini";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const CreateProjectForm = ({
  userId,
  allUsers,
}: {
  userId: string;
  allUsers: {
    id: string;
    email: string;
    name: string;
  }[];
}) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Gemini-related states
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [descriptionSummary, setDescriptionSummary] = useState<string>("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] =
    useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [showTitleSuggestions, setShowTitleSuggestions] =
    useState<boolean>(false);

  // Debounce timers for API calls
  const summaryTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Generate short title suggestions based on the user's input
  async function generateTitleSuggestions() {
    // Only proceed if user has entered something for the title
    if (!projectName.trim()) {
      toast.error("Please enter a title first");
      return;
    }

    setIsGeneratingTitle(true);
    setShowTitleSuggestions(true);
    try {
      // Use the user's title as the starting point for suggestions
      const basePrompt = `Based on the title "${projectName}", generate 3 alternative short, concise project title suggestions. Each suggestion should be no more than 3-4 words. Keep them simple, professional, and memorable. Directly give me the three alternative suggestions without saying here are 3 suggestions.`;

      // Include description for context if available
      const prompt = projectDescription
        ? `${basePrompt}. Context: ${projectDescription}. Make the suggestions different from but related to the original title.`
        : `${basePrompt}. Make the suggestions different from but related to the original title.`;

      const suggestions = await generateSuggestions(prompt);

      // Parse suggestions and ensure we have exactly 3
      let parsedSuggestions = suggestions
        .split("\n")
        .map((s) =>
          s
            .replace(/^\d+\.\s*/, "")
            .replace(/^-\s*/, "")
            .trim()
        ) // Remove numbering and bullets
        .filter(Boolean)
        .filter((s) => s.toLowerCase() !== projectName.toLowerCase()); // Remove exact matches to user input

      // Ensure the suggestions are unique
      parsedSuggestions = [...new Set(parsedSuggestions)];

      // Add fallbacks if needed
      while (parsedSuggestions.length < 3) {
        const fallbacks = [
          `${projectName} Pro`,
          `${projectName} Plus`,
          `${projectName} 2.0`,
          `Smart ${projectName}`,
          `Prime ${projectName}`,
        ];

        for (const fallback of fallbacks) {
          if (
            !parsedSuggestions.includes(fallback) &&
            fallback.toLowerCase() !== projectName.toLowerCase() &&
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
        `${projectName} Pro`,
        `Smart ${projectName}`,
        `${projectName} Plus`,
      ]);
    } finally {
      setIsGeneratingTitle(false);
    }
  }

  // Summarize description using Gemini
  async function summarizeDescription(description: string) {
    setProjectDescription(description);

    // Don't summarize if description is too short (less than 5 words)
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
        const prompt = `Here is the description written by the user to create a project, summarize the following project description and make it sound professtional: ${description}`;
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
      setProjectDescription(descriptionSummary);
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
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;

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

    const data: CreateProjectInput = {
      name,
      description,
      start_date: startDate.toISOString(),
      deadline: deadline.toISOString(),
      ownerId: userId,
    };

    if (!data.name || !data.deadline || !data.ownerId || !data.start_date) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createProjectAction(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        // Add project members if any are selected
        if (selectedUsers.length > 0) {
          if (!result.data?.id) {
            throw new Error("Project ID is undefined");
          }
          const addMemberPromises = selectedUsers.map((memberId) =>
            addProjectMemberAction({
              projectId: result.data.id,
              userId: memberId,
              role: "member",
            })
          );

          const memberResults = await Promise.all(addMemberPromises);
          const memberErrors = memberResults.filter((result) => result.error);

          if (memberErrors.length > 0) {
            toast.error(
              `Project created but some members couldn't be added: ${memberErrors
                .map((error) => error.error)
                .join(", ")}`
            );
          } else {
            toast.success(
              "Project created successfully with all members added"
            );
            router.refresh();
          }
        } else {
          toast.success("Project created successfully");
          router.refresh();
        }

        (event.target as HTMLFormElement).reset();
        setIsOpen(false);
        setStartDate("");
        setDeadline("");
        setSelectedUsers([]);
        setProjectName("");
        setProjectDescription("");
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
      setSelectedUsers([]);
      setIsLoading(false);
      setProjectName("");
      setProjectDescription("");
      setTitleSuggestions([]);
      setDescriptionSummary("");
      setShowTitleSuggestions(false);
    }
    setIsOpen(open);
  };

  const now = new Date().toISOString().slice(0, 16);

  const selectedUserNames = selectedUsers
    .map((id) => {
      const user = allUsers.find((user) => user.id === id);
      return user
        ? user.name
          ? `${user.name} (${user.email})`
          : `${user.email}`
        : "";
    })
    .filter(Boolean);
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Create New Project
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
            <Label htmlFor="name" className="flex items-center">
              Project Name
            </Label>
            <div className="flex gap-2">
              <Input
                id="name"
                name="name"
                placeholder="Project Name"
                aria-label="Project Name"
                maxLength={120}
                required
                disabled={isLoading}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex-1"
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateTitleSuggestions}
                    disabled={isGeneratingTitle || !projectName.trim()}
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
                  <p>Generate shorter title suggestions</p>
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

                <Card className="border bg-gradient-to-r from-indigo-50 to-purple-50 dark:bg-gradient-to-r dark:from-indigo-900 dark:to-purple-900 max-w-[512px] overflow-auto">
                  <CardContent className="p-2">
                    <p className="text-sm font-medium mb-2 flex items-center">
                      <Sparkles className="h-3 w-3 mr-2 text-indigo-600" />
                      Short Title Suggestions
                    </p>

                    {isGeneratingTitle ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-5 w-5 text-indigo-600 animate-spin mr-2" />
                        <span className="text-sm text-indigo-600">
                          {`Creating short titles based on "${projectName}"...`}
                        </span>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {titleSuggestions.map((title, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start text-left h-auto py-2 hover:bg-indigo-100 hover:text-indigo-900 hover:border-indigo-300 transition-all max-w-[512px] overflow-auto"
                            onClick={() => {
                              setProjectName(title);
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
              value={projectDescription}
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
            <Label className="flex items-center">Add Project Members</Label>
            <div className="flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[300px]">
                        {selectedUsers.length > 0
                          ? selectedUserNames.join(", ")
                          : "Select members..."}
                      </div>
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {allUsers
                        .filter((user) => user.id !== userId) // Exclude the project owner
                        .map((user) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => {
                              if (!selectedUsers.includes(user.id)) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              }
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUsers.includes(user.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {user.name} | {user.email}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedUsers.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedUsers([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedUsers.length > 0 && (
              <p className="text-xs text-gray-500">
                {selectedUsers.length} member(s) selected
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
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                disabled={isLoading}
              />
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
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create Project</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectForm;
