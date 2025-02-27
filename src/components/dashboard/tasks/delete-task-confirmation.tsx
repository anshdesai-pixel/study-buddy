"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteTaskAction } from "@/app/_actions/task.actions";
import { Trash } from "lucide-react";

const DeleteTasksConfirmation = ({
  task,
}: {
  task: {
    id: string;
    title: string;
    description: string;
    deadline: Date;
  };
}) => {
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      const result = await deleteTaskAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Task deleted successfully");
        setDeleteConfirmTask(null);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={deleteConfirmTask === task.id}
      onOpenChange={(open) => !open && setDeleteConfirmTask(null)}
    >
      <Button
        variant="outline"
        size="sm"
        className="text-red-500"
        aria-label="Delete task"
        onClick={() => setDeleteConfirmTask(task.id)}
      >
        <Trash className="w-4 h-4 text-red-500" />
        Delete
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            {`Are you sure you want to delete "${task.title}"? This action cannot
            be undone.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmTask(null)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(task.id)}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTasksConfirmation;
