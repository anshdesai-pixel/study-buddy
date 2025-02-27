"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateNoteAction } from "@/app/_actions/note.actions";
import { UpdateNoteInput } from "@/common/types/request/note.types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditIcon } from "lucide-react";

const UpdateNoteForm = ({
  note,
}: {
  note: {
    id: string;
    title: string;
    content: string;
  };
}) => {
  const [editingNote, setEditingNote] = useState<{
    id: string;
    title: string;
    content: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingNote) return;

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const data: UpdateNoteInput = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    };

    try {
      const result = await updateNoteAction(editingNote.id, data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Note updated successfully");
        setEditingNote(null);
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
      open={editingNote?.id === note.id}
      onOpenChange={(open) => !open && setEditingNote(null)}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Edit note"
          className="text-blue-500"
          onClick={() => setEditingNote(note)}
        >
          <EditIcon className="w-4 h-4 text-blue-500" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            name="title"
            defaultValue={editingNote?.title}
            placeholder="Note title"
            required
            disabled={isLoading}
          />
          <Textarea
            name="content"
            defaultValue={editingNote?.content}
            placeholder="Note content"
            disabled={isLoading}
            className="min-h-[100px]"
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingNote(null)}
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
  );
};

export default UpdateNoteForm;
