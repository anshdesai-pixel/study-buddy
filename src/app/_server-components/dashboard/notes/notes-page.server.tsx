import { getUserNotesAction } from "@/app/_actions/user.actions";
import { INote } from "@/common/interface/dashboard.interface";
import NotePageClient from "@/components/dashboard/notes/notes-page.client";
import { stackServerApp } from "@/lib/stack";
import React from "react";

const NotesPageServer = async () => {
  const user = await stackServerApp.getUser();

  const allNotes = await getUserNotesAction(user ? user.id : "");

  return (
    <NotePageClient
      allNotes={
        allNotes.data?.note?.map((note: INote) => ({
          id: note.id,
          title: note.title,
          content: note.content || "",
        })) || []
      }
      userId={user ? user.id : ""}
    />
  );
};
export default NotesPageServer;
