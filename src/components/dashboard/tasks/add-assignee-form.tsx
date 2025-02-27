"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Search, UserPlus2, X } from "lucide-react";
import {
  Command,
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
import { toast } from "sonner";
import { ITaskMember } from "@/common/interface/dashboard.interface";
import { getTaskMembersByTaskAction } from "@/app/_actions/task.actions";
import {
  isTaskMemberAction,
  addTaskMemberAction,
} from "@/app/_actions/task-member.actions";

const AddAssigneeForm = ({
  task,
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
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<ITaskMember[]>([]);
  const [availableMembers, setAvailableMembers] = React.useState<ITaskMember[]>(
    []
  );
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      for (const member of selectedUsers) {
        await addTaskMemberAction({
          role: "member",
          taskId: task.id,
          userId: member.id,
        });
      }
      toast.success("Assignees added successfully.");
      setSelectedUsers([]);
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to add assignees.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use the actual member objects instead of just IDs for better display
  const selectedUserNames = selectedUsers
    .map((member) => member.name || member.email)
    .join(", ");

  const fetchTaskMembers = async () => {
    setIsFetching(true);
    try {
      const taskMembersResponse = await getTaskMembersByTaskAction(task.id);
      const members = taskMembersResponse.data as unknown as ITaskMember[];

      // Use Promise.all to run all member checks in parallel
      const memberChecks = members.map(async (member) => {
        const isMemberResponse = await isTaskMemberAction(task.id, member.id);
        return !isMemberResponse.data ? member : null;
      });

      // Wait for all promises to resolve and filter out null values
      const available = (await Promise.all(memberChecks)).filter(
        Boolean
      ) as ITaskMember[];

      setAvailableMembers(available);
    } catch (error) {
      toast.error("Failed to fetch members.");
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 justify-end">
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (open) fetchTaskMembers();
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="Edit task"
              className="text-blue-500"
            >
              <UserPlus2 className="w-4 h-4 text-blue-500" />
              Add Assignee
            </Button>
          </DialogTrigger>
          <DialogContent onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Add Assignee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Assignees (Optional)</Label>
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
                              ? selectedUserNames
                              : "Select assignees..."}
                          </div>
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search users..." />
                        <CommandGroup>
                          {isFetching ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                              <span className="ml-2">Loading members...</span>
                            </div>
                          ) : availableMembers.length > 0 ? (
                            availableMembers.map((member) => (
                              <CommandItem
                                key={member.id}
                                onSelect={() => {
                                  if (
                                    !selectedUsers.some(
                                      (u) => u.id === member.id
                                    )
                                  ) {
                                    setSelectedUsers([
                                      ...selectedUsers,
                                      member,
                                    ]);
                                  }
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUsers.some(
                                      (u) => u.id === member.id
                                    )
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {member.name ? member.name : member.email}
                              </CommandItem>
                            ))
                          ) : (
                            <CommandItem disabled>
                              No available members to assign
                            </CommandItem>
                          )}
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
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Cancel Button"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedUsers([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  aria-label="Submit Button"
                  disabled={isLoading || selectedUsers.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AddAssigneeForm;
