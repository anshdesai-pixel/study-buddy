import { db } from "@/db/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateTaskMemberInput,
  UpdateTaskMemberInput,
} from "@/common/types/request/task-member.types";

export const getTaskMemberById = async (id: string) => {
  try {
    return await db.task_member.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Failed to get task member with ID ${id}:`, error);
    throw new Error(
      `Failed to get task member: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getTaskMembers = async (taskId: string) => {
  try {
    return await db.task_member.findMany({
      where: { taskId },
      include: {
        users_sync: true,
      },
    });
  } catch (error) {
    console.error(`Failed to get members for task ID ${taskId}:`, error);
    throw new Error(
      `Failed to get task members: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getUserTaskMemberships = async (userId: string) => {
  try {
    return await db.task_member.findMany({
      where: { userId },
      include: {
        task: true,
      },
    });
  } catch (error) {
    console.error(
      `Failed to get task memberships for user ID ${userId}:`,
      error
    );
    throw new Error(
      `Failed to get user task memberships: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const addTaskMember = async (data: CreateTaskMemberInput) => {
  try {
    return await db.task_member.create({
      data: data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("This user is already a member of the task");
      } else if (error.code === "P2003") {
        if (
          error.meta?.field_name &&
          typeof error.meta.field_name === "string"
        ) {
          if (error.meta.field_name.includes("taskId")) {
            throw new Error("The referenced task does not exist");
          } else if (error.meta.field_name.includes("userId")) {
            throw new Error("The referenced user does not exist");
          }
        }
      }
    }
    console.error("Failed to add task member:", error);
    throw new Error(
      `Failed to add task member: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const updateTaskMember = async (
  id: string,
  data: UpdateTaskMemberInput
) => {
  try {
    return await db.task_member.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Task member with ID ${id} not found`);
      }
    }
    console.error(`Failed to update task member with ID ${id}:`, error);
    throw new Error(
      `Failed to update task member: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const removeTaskMember = async (id: string) => {
  try {
    return await db.task_member.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Task member with ID ${id} not found`);
      }
    }
    console.error(`Failed to remove task member with ID ${id}:`, error);
    throw new Error(
      `Failed to remove task member: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const isTaskMember = async (taskId: string, userId: string) => {
  try {
    const member = await db.task_member.findFirst({
      where: {
        taskId,
        userId,
      },
    });
    return !!member;
  } catch (error) {
    console.error(
      `Failed to check membership for task ${taskId} and user ${userId}:`,
      error
    );
    throw new Error(
      `Failed to check task membership: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
