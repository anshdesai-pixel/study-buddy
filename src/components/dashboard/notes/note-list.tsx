"use client";

import EditNoteForm from "./edit-note-form";
import DeleteNoteConfirmation from "./delete-note-confirmation";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NoteDetailDialog = ({
  note,
  isOpen,
  onClose,
}: {
  note: { id: string; title: string; content: string };
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-80px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Content</h4>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {note.content}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function NoteList({
  allNotes,
}: {
  allNotes: { id: string; title: string; content: string }[];
}) {
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(
    null
  );
  const selectedNote = allNotes.find((note) => note.id === selectedNoteId);

  return (
    <div className="space-y-4">
      {allNotes.map((note) => (
        <div
          key={note.id}
          className="border rounded-lg p-4 relative hover:shadow-md dark:shadow-blue-500/30 shadow-black/30 transition-shadow cursor-pointer duration-300"
          onClick={() => setSelectedNoteId(note.id)}
        >
          <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
          <p className="text-sm text-gray-500 mb-2">
            {note.content.length > 50
              ? `${note.content.substring(0, 50)}...`
              : note.content}
          </p>
          <div
            className="flex space-x-2 justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <EditNoteForm note={note} />
            <DeleteNoteConfirmation note={note} />
          </div>
        </div>
      ))}

      {selectedNote && (
        <NoteDetailDialog
          note={selectedNote}
          isOpen={!!selectedNoteId}
          onClose={() => setSelectedNoteId(null)}
        />
      )}
    </div>
  );
}
