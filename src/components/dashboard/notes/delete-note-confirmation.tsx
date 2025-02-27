"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteNoteAction } from "@/app/_actions/note.actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";

const DeleteNoteConfirmation = ({
  note,
}: {
  note: {
    id: string;
    title: string;
    content: string;
  };
}) => {
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      const result = await deleteNoteAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Note deleted successfully");
        setDeleteConfirmNote(null);
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
      open={deleteConfirmNote === note.id}
      onOpenChange={(open) => !open && setDeleteConfirmNote(null)}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Delete note"
          className="text-red-500"
          onClick={() => setDeleteConfirmNote(note.id)}
        >
          <Trash className="w-4 h-4 text-red-500" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Note</DialogTitle>
          <DialogDescription>
            {`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmNote(null)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(note.id)}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteNoteConfirmation;
