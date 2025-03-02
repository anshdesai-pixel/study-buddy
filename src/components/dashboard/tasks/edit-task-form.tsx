/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpdateTaskInput } from "@/common/types/request/task.types";
import { updateTaskAction } from "@/app/_actions/task.actions";
import { Label } from "@/components/ui/label";
import { EditIcon, Search, X, AlertCircle } from "lucide-react";
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
import { Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EditTaskForm = ({
  task,
  allProjects,
}: {
  task: {
    id: string;
    title: string;
    description: string;
    start_date: Date;
    deadline: Date;
    is_project_task: boolean;
    projectId?: string | null;
  };
  allProjects: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
  }[];
}) => {
  const [editingTask, setEditingTask] = useState<{
    id: string;
    title: string;
    description: string;
    start_date: Date;
    deadline: Date;
    is_project_task: boolean;
    projectId?: string | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(
    task.projectId || null
  );
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projectValidationError, setProjectValidationError] = useState<
    string | null
  >(null);

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
    if (selectedProject && selectedProjectData && deadline) {
      // If the current deadline is beyond the project deadline, reset it
      const projectDeadline = new Date(selectedProjectData.deadline);
      const taskDeadline = new Date(deadline + "Z");
      if (taskDeadline > projectDeadline) {
        setDeadline("");
      }
    }
  }, [selectedProject, selectedProjectData, deadline]);

  // Initialize form values when editing task is set
  useEffect(() => {
    if (editingTask) {
      setStartDate(formatDate(editingTask.start_date));
      setDeadline(formatDate(editingTask.deadline));
    }
  }, [editingTask]);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTask) return;

    setIsLoading(true);

    // Get values from form or state
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const startDateStr = startDate;
    const deadlineStr = deadline;

    const start_date = new Date(startDateStr + "Z");
    if (isNaN(start_date.getTime())) {
      toast.error("Please enter a valid start date");
      setIsLoading(false);
      return;
    }

    const deadlineDate = new Date(deadlineStr + "Z");
    if (isNaN(deadlineDate.getTime())) {
      toast.error("Please enter a valid deadline date");
      setIsLoading(false);
      return;
    }

    const now = new Date();

    // Validate dates
    if (deadlineDate < start_date) {
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
          `Cannot update task for project "${selectedProjectData.name}" as it has not started yet`
        );
        setIsLoading(false);
        return;
      }

      // Check if task deadline is after project deadline
      if (deadlineDate > projectDeadline) {
        toast.error(
          `Task deadline cannot be after the project deadline (${projectDeadline.toLocaleDateString()})`
        );
        setIsLoading(false);
        return;
      }
    }

    const data: UpdateTaskInput = {
      title,
      description,
      start_date: start_date.toISOString(),
      deadline: deadlineDate.toISOString(),
      projectId: selectedProject,
      is_project_task: selectedProject !== null,
    };

    try {
      const result = await updateTaskAction(editingTask.id, data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Task updated successfully");
        setEditingTask(null);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function formatDate(date: Date) {
    const isoString = new Date(date).toISOString();
    return isoString.slice(0, 16); // Format as YYYY-MM-DDTHH:mm
  }

  const selectedProjectName = allProjects.find(
    (p) => p.id === selectedProject
  )?.name;

  // Get project deadline as ISO string for max deadline date
  const maxDeadline = selectedProjectData
    ? new Date(selectedProjectData.deadline).toISOString().slice(0, 16)
    : null;

  const now = new Date().toISOString().slice(0, 16);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 justify-end">
        <Dialog
          open={editingTask?.id === task.id}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTask(null);
              setSelectedProject(task.projectId || null);
              setProjectValidationError(null);
              setStartDate("");
              setDeadline("");
            }
          }}
        >
          <Button
            variant="outline"
            size="sm"
            aria-label="Edit task"
            className="text-blue-500"
            onClick={() => setEditingTask(task)}
          >
            <EditIcon className="w-4 h-4 text-blue-500" />
            Edit
          </Button>
          <DialogContent onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingTask?.title}
                  placeholder="Task title"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingTask?.description}
                  placeholder="Add description"
                  disabled={isLoading}
                  className="min-h-[100px] max-h-[400px]"
                />
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
                                  selectedProject === project.id
                                    ? null
                                    : project.id
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
                    {new Date(
                      selectedProjectData.start_date
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      selectedProjectData.deadline
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  min={now}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  type="datetime-local"
                  id="deadline"
                  name="deadline"
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
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingTask(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading || (!!projectValidationError && !!selectedProject)
                  }
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EditTaskForm;
