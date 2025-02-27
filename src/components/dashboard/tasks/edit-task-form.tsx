"use client";

import React from "react";
import { useState } from "react";
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
import { EditIcon, Search, X } from "lucide-react";
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

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTask) return;

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const startDateStr = formData.get("start_date") as string;
    const deadlineStr = formData.get("deadline") as string;

    const start_date = new Date(startDateStr);
    if (isNaN(start_date.getTime())) {
      toast.error("Please enter a valid start date");
      setIsLoading(false);
      return;
    }

    const deadline = new Date(deadlineStr);
    if (isNaN(deadline.getTime())) {
      toast.error("Please enter a valid deadline date");
      setIsLoading(false);
      return;
    }

    // Validate dates
    if (start_date < new Date()) {
      toast.error("Start date cannot be in the past");
      setIsLoading(false);
      return;
    }

    if (deadline < start_date) {
      toast.error("Deadline cannot be before the start date");
      setIsLoading(false);
      return;
    }

    const data: UpdateTaskInput = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      start_date: start_date.toISOString(),
      deadline: deadline.toISOString(),
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 justify-end">
        <Dialog
          open={editingTask?.id === task.id}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTask(null);
              setSelectedProject(task.projectId || null);
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
                <Input
                  name="title"
                  defaultValue={editingTask?.title}
                  placeholder="Task title"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Textarea
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
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  type="datetime-local"
                  name="start_date"
                  defaultValue={
                    editingTask ? formatDate(editingTask.start_date) : ""
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  type="datetime-local"
                  name="deadline"
                  defaultValue={
                    editingTask ? formatDate(editingTask.deadline) : ""
                  }
                  required
                  disabled={isLoading}
                />
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
                <Button type="submit" disabled={isLoading}>
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
