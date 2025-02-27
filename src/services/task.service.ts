import { db } from "@/db/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateTaskInput,
  UpdateTaskInput,
} from "@/common/types/request/task.types";

export const getAllTasks = async () => {
  try {
    return await db.task.findMany();
  } catch (error) {
    console.error("Failed to get all tasks:", error);
    throw new Error(
      `Failed to get all tasks: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getTaskById = async (id: string) => {
  try {
    return await db.task.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Failed to get task with ID ${id}:`, error);
    throw new Error(
      `Failed to get task: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getTasksByUserId = async (userId: string) => {
  try {
    return await db.task.findMany({
      where: { userId },
    });
  } catch (error) {
    console.error(`Failed to get tasks for user ID ${userId}:`, error);
    throw new Error(
      `Failed to get user tasks: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getUpcomingTasks = async (userId: string, days: number = 7) => {
  try {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    return await db.task.findMany({
      where: {
        userId,
        deadline: {
          gte: today,
          lte: endDate,
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });
  } catch (error) {
    console.error(`Failed to get upcoming tasks for user ID ${userId}:`, error);
    throw new Error(
      `Failed to get upcoming tasks: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const createTask = async (data: CreateTaskInput) => {
  try {
    return await db.task.create({
      data: data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A task with this identifier already exists");
      } else if (error.code === "P2003") {
        throw new Error("The referenced user does not exist");
      }
    }
    console.error("Failed to create task:", error);
    throw new Error(
      `Failed to create task: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const updateTask = async (id: string, data: UpdateTaskInput) => {
  try {
    return await db.task.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Task with ID ${id} not found`);
      }
    }
    console.error(`Failed to update task with ID ${id}:`, error);
    throw new Error(
      `Failed to update task: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const deleteTask = async (id: string) => {
  try {
    return await db.task.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Task with ID ${id} not found`);
      }
    }
    console.error(`Failed to delete task with ID ${id}:`, error);
    throw new Error(
      `Failed to delete task: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getTaskMembers = async (taskId: string) => {
  try {
    const taskMembers = await db.task_member.findMany({
      where: {
        taskId: taskId,
      },
    });

    const formattedTaskMembers = await Promise.all(
      taskMembers.map(async (taskMember) => {
        const user = await db.users_sync.findUnique({
          where: { id: taskMember.userId ?? "" },
        });

        return {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          role: taskMember.role,
        };
      })
    );

    const projectTask = await db.task.findUnique({
      where: { id: taskId },
    });

    const projectMembers = await db.project_member.findMany({
      where: {
        projectId: projectTask?.projectId ?? "",
      },
    });

    const members = await Promise.all(
      projectMembers.map(async (projectMember) => {
        const users = await db.users_sync.findUnique({
          where: { id: projectMember?.userId },
        });

        return {
          id: users?.id,
          name: users?.name,
          email: users?.email,
          role: projectMember?.role,
        };
      })
    );

    return [...members, ...formattedTaskMembers];
  } catch (error) {
    console.error(`Failed to get members for task ID ${taskId}:`, error);
    throw new Error(
      `Failed to get task members: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
