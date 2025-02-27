"use server";

import {
  getTaskMemberById,
  getTaskMembers,
  getUserTaskMemberships,
  addTaskMember,
  updateTaskMember,
  removeTaskMember,
  isTaskMember,
} from "@/services/task-member.service";
import {
  CreateTaskMemberInput,
  UpdateTaskMemberInput,
} from "@/common/types/request/task-member.types";
import {
  revalidateNotes,
  revalidateProjects,
  revalidateTasks,
} from "@/revalidations/dashboard/revalidate-dashboard";

export async function getTaskMemberByIdAction(id: string) {
  try {
    const member = await getTaskMemberById(id);
    return { data: member, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch task member",
    };
  }
}

export async function getTaskMembersAction(taskId: string) {
  try {
    const members = await getTaskMembers(taskId);
    return { data: members, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch task members",
    };
  }
}

export async function getUserTaskMembershipsAction(userId: string) {
  try {
    const memberships = await getUserTaskMemberships(userId);
    return { data: memberships, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user task memberships",
    };
  }
}

export async function addTaskMemberAction(data: CreateTaskMemberInput) {
  try {
    const member = await addTaskMember(data);
    revalidateNotes();
    revalidateProjects();
    revalidateTasks();
    return { data: member, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to add task member",
    };
  }
}

export async function updateTaskMemberAction(
  id: string,
  data: UpdateTaskMemberInput
) {
  try {
    const member = await updateTaskMember(id, data);
    revalidateNotes();
    revalidateTasks();
    return { data: member, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to update task member",
    };
  }
}

export async function removeTaskMemberAction(id: string) {
  try {
    const member = await removeTaskMember(id);
    revalidateNotes();
    revalidateTasks();
    return { data: member, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to remove task member",
    };
  }
}

export async function isTaskMemberAction(taskId: string, userId: string) {
  try {
    const member = await isTaskMember(taskId, userId);
    return { data: member, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to check task member",
    };
  }
}
