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
import { Check, EditIcon, Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { UpdateProjectInput } from "@/common/types/request/project.types";
import { updateProjectAction } from "@/app/_actions/project.actions";
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
import { useRouter } from "next/navigation";

const EditProjectForm = ({
  project,
  allUsers,
  currentMembers,
  onMembersUpdated,
}: {
  project: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
  };
  allUsers: {
    id: string;
    email: string;
    name: string;
  }[];
  currentMembers: string[];
  onMembersUpdated: () => void;
}) => {
  const router = useRouter();
  const [editingProject, setEditingProject] = useState<{
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(currentMembers);
  const [open, setOpen] = useState(false);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProject) return;

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const startDateStr = formData.get("start_date") as string;
    const deadlineStr = formData.get("deadline") as string;

    const start_date = new Date(startDateStr + "Z");
    if (isNaN(start_date.getTime())) {
      toast.error("Please enter a valid start date");
      setIsLoading(false);
      return;
    }

    const deadline = new Date(deadlineStr + "Z");
    if (isNaN(deadline.getTime())) {
      toast.error("Please enter a valid deadline date");
      setIsLoading(false);
      return;
    }

    // Validate that deadline is after start date
    if (deadline < start_date) {
      toast.error("Deadline cannot be before the start date");
      setIsLoading(false);
      return;
    }

    const data: UpdateProjectInput = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      start_date: start_date.toISOString(),
      deadline: deadline.toISOString(),
    };

    try {
      const result = await updateProjectAction(editingProject.id, data);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Handle member updates
      const newMembers = selectedUsers.filter(
        (id) => !currentMembers.includes(id)
      );

      if (newMembers.length > 0) {
        const addMemberPromises = newMembers.map((memberId) =>
          addProjectMemberAction({
            projectId: editingProject.id,
            userId: memberId,
            role: "member",
          })
        );

        const memberResults = await Promise.all(addMemberPromises);
        const memberErrors = memberResults.filter((result) => result.error);

        if (memberErrors.length > 0) {
          toast.error(
            `Project updated but some members couldn't be added: ${memberErrors
              .map((error) => error.error)
              .join(", ")}`
          );
        } else {
          toast.success(
            "Project updated successfully with all new members added"
          );
        }

        // Call the callback to refresh members
        onMembersUpdated();
      } else {
        toast.success("Project updated successfully");
      }
      router.refresh();
      setEditingProject(null);
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

  const selectedUserNames = selectedUsers.map(
    (id) => allUsers.find((user) => user.id === id)?.name
  );

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 justify-end">
        <Dialog
          open={editingProject?.id === project.id}
          onOpenChange={(open) => {
            if (!open) {
              setEditingProject(null);
              setSelectedUsers(currentMembers); // Reset to current members when closing
            }
          }}
        >
          <Button
            variant="outline"
            size="sm"
            aria-label="Edit"
            className="text-blue-500"
            onClick={() => {
              setEditingProject(project);
              setSelectedUsers(currentMembers); // Initialize with current members
            }}
          >
            <EditIcon className="w-4 h-4 text-blue-500" />
            Edit
          </Button>
          <DialogContent onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Input
                  name="name"
                  defaultValue={editingProject?.name}
                  placeholder="Project name"
                  aria-label="Project name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Textarea
                  name="description"
                  defaultValue={editingProject?.description}
                  placeholder="Add description"
                  aria-label="Project description"
                  disabled={isLoading}
                  className="min-h-[100px] max-h-[400px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Project Members</Label>
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
                          <div className="overflow-auto max-w-[300px]">
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
                        <CommandGroup>
                          {allUsers
                            .filter((user) => !currentMembers.includes(user.id)) // Only show users who aren't current members
                            .map((user) => (
                              <CommandItem
                                key={user.id}
                                onSelect={() => {
                                  if (!selectedUsers.includes(user.id)) {
                                    setSelectedUsers([
                                      ...selectedUsers,
                                      user.id,
                                    ]);
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
                  {selectedUsers.length > currentMembers.length && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedUsers(currentMembers)} // Reset to current members
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
                    editingProject ? formatDate(editingProject.start_date) : ""
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
                    editingProject ? formatDate(editingProject.deadline) : ""
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Cancel"
                  onClick={() => {
                    setEditingProject(null);
                    setSelectedUsers(currentMembers); // Reset members on cancel
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} aria-label="Submit">
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

export default EditProjectForm;
