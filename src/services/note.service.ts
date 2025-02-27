import { db } from "@/db/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateNoteInput,
  UpdateNoteInput,
} from "@/common/types/request/note.types";

export const getAllNotes = async () => {
  try {
    return await db.note.findMany();
  } catch (error) {
    console.error("Failed to get all notes:", error);
    throw new Error(
      `Failed to get all notes: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getNoteById = async (id: string) => {
  try {
    return await db.note.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Failed to get note with ID ${id}:`, error);
    throw new Error(
      `Failed to get note: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getNotesByUserId = async (userId: string) => {
  try {
    return await db.note.findMany({
      where: { userId },
    });
  } catch (error) {
    console.error(`Failed to get notes for user ID ${userId}:`, error);
    throw new Error(
      `Failed to get user notes: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const createNote = async (data: CreateNoteInput) => {
  try {
    return await db.note.create({
      data: data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A note with this identifier already exists");
      } else if (error.code === "P2003") {
        throw new Error("The referenced user does not exist");
      }
    }
    console.error("Failed to create note:", error);
    throw new Error(
      `Failed to create note: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const updateNote = async (id: string, data: UpdateNoteInput) => {
  try {
    return await db.note.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Note with ID ${id} not found`);
      }
    }
    console.error(`Failed to update note with ID ${id}:`, error);
    throw new Error(
      `Failed to update note: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const deleteNote = async (id: string) => {
  try {
    return await db.note.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Note with ID ${id} not found`);
      }
    }
    console.error(`Failed to delete note with ID ${id}:`, error);
    throw new Error(
      `Failed to delete note: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
