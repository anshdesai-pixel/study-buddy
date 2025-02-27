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
import { deleteProjectAction } from "@/app/_actions/project.actions";
import { Trash } from "lucide-react";

const DeleteProjectConfirmation = ({
  project,
}: {
  project: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
  };
}) => {
  const [deleteConfirmProject, setDeleteConfirmTProject] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      const result = await deleteProjectAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Project deleted successfully");
        setDeleteConfirmTProject(null);
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
      open={deleteConfirmProject === project.id}
      onOpenChange={(open) => !open && setDeleteConfirmTProject(null)}
    >
      <Button
        variant="outline"
        size="sm"
        className="text-red-500"
        onClick={() => setDeleteConfirmTProject(project.id)}
      >
        <Trash className="w-4 h-4 text-red-500" />
        Delete
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            {`Are you sure you want to delete "${project.name}"? This action cannot
            be undone.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmTProject(null)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(project.id)}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProjectConfirmation;
