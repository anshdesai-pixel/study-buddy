"use server";

import { revalidatePath } from "next/cache";
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  getNotesByUserId,
  updateNote,
} from "@/services/note.service";
import {
  CreateNoteInput,
  UpdateNoteInput,
} from "@/common/types/request/note.types";
import { revalidateNotes } from "@/revalidations/dashboard/revalidate-dashboard";

export async function getAllNotesAction() {
  try {
    const notes = await getAllNotes();
    revalidatePath("/notes");
    return { data: notes, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch notes",
    };
  }
}

export async function getNoteByIdAction(id: string) {
  try {
    const note = await getNoteById(id);
    revalidatePath(`/notes/${id}`);
    return { data: note, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch note",
    };
  }
}

export async function getNotesByUserIdAction(userId: string) {
  try {
    const notes = await getNotesByUserId(userId);
    revalidatePath(`/dashboard/notes`);
    return { data: notes, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch user notes",
    };
  }
}

export async function createNoteAction(data: CreateNoteInput) {
  try {
    const note = await createNote(data);
    revalidateNotes();
    return { data: note, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to create note",
    };
  }
}

export async function updateNoteAction(id: string, data: UpdateNoteInput) {
  try {
    const note = await updateNote(id, data);
    revalidateNotes();
    return { data: note, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update note",
    };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    const note = await deleteNote(id);
    revalidateNotes();
    return { data: note, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to delete note",
    };
  }
}
