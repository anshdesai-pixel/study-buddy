"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NoteList from "./note-list";
import CreateNoteForm from "./create-note-form";

const NotePageClient = ({
  allNotes,
  userId,
}: {
  allNotes: { id: string; title: string; content: string }[];
  userId: string;
}) => {
  return (
    <Card className="border-0 shadow-none p-0 m-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>My Notes</CardTitle>
          <CreateNoteForm userId={userId} />
        </div>
      </CardHeader>
      <CardContent>
        {allNotes.length === 0 ? (
          <div className="text-center text-gray-500">
            No notes found. Add a new note to get started.
          </div>
        ) : (
          <NoteList allNotes={allNotes} />
        )}
      </CardContent>
    </Card>
  );
};

export default NotePageClient;
