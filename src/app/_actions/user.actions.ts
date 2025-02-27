"use server";

import {
  getUserById,
  getUserByEmail,
  getAllUsers,
  getUserNotes,
  getUserTasks,
  getUserProjects,
  softDeleteUser,
  updateUserName,
} from "@/services/user.service";
import { revalidateUsers } from "@/revalidations/dashboard/revalidate-dashboard";

export async function getUserByIdAction(id: string) {
  try {
    const user = await getUserById(id);
    return { data: user, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
}

export async function getUserByEmailAction(email: string) {
  try {
    const user = await getUserByEmail(email);
    return { data: user, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user by email",
    };
  }
}

export async function getAllUsersAction() {
  try {
    const users = await getAllUsers();
    return { data: users, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

export async function getUserNotesAction(userId: string) {
  try {
    const userNotes = await getUserNotes(userId);
    return { data: userNotes, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch user notes",
    };
  }
}

export async function getUserTasksAction(userId: string) {
  try {
    const userTasks = await getUserTasks(userId);
    return { data: userTasks, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch user tasks",
    };
  }
}

export async function getUserProjectsAction(userId: string) {
  try {
    const userProjects = await getUserProjects(userId);
    return { data: userProjects, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user projects",
    };
  }
}

export async function softDeleteUserAction(id: string) {
  try {
    const user = await softDeleteUser(id);
    revalidateUsers();
    return { data: user, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to soft delete user",
    };
  }
}

export async function updateUserNameAction(id: string, name: string) {
  try {
    const user = await updateUserName(id, name);
    revalidateUsers();
    return { data: user, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to update user name",
    };
  }
}
