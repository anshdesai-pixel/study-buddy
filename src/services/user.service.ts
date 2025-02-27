import { db } from "@/db/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const getUserById = async (id: string) => {
  try {
    return await db.users_sync.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Failed to get user with ID ${id}:`, error);
    throw new Error(
      `Failed to get user: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    return await db.users_sync.findFirst({
      where: { email },
    });
  } catch (error) {
    console.error(`Failed to get user with email ${email}:`, error);
    throw new Error(
      `Failed to get user by email: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getAllUsers = async () => {
  try {
    return await db.users_sync.findMany({
      where: {
        deleted_at: null,
      },
    });
  } catch (error) {
    console.error("Failed to get all users:", error);
    throw new Error(
      `Failed to get all users: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getUserNotes = async (userId: string) => {
  try {
    return await db.users_sync.findUnique({
      where: { id: userId },
      include: {
        note: true,
      },
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

export const getUserTasks = async (userId: string) => {
  try {
    const userTasks = await db.task.findMany({
      where: {
        OR: [
          { userId: userId },
          {
            task_member: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      distinct: ["id"], // Ensures no duplicates in the result
    });

    return userTasks;
  } catch (error) {
    console.error(`Failed to get tasks for user ID ${userId}:`, error);
    throw new Error(
      `Failed to get user tasks: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getUserProjects = async (userId: string) => {
  try {
    const userProjects = await db.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            project_member: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      distinct: ["id"], // Ensures no duplicates in the result
    });

    return userProjects;
  } catch (error) {
    console.error(`Failed to get projects for user ID ${userId}:`, error);
    throw new Error(
      `Failed to get user projects: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const softDeleteUser = async (id: string) => {
  try {
    return await db.users_sync.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`User with ID ${id} not found`);
      }
    }
    console.error(`Failed to soft delete user with ID ${id}:`, error);
    throw new Error(
      `Failed to soft delete user: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const updateUserName = async (id: string, name: string) => {
  try {
    return await db.users_sync.update({
      where: { id },
      data: {
        name,
        raw_json: {
          path: ["display_name"],
          value: name,
        },
        updated_at: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`User with ID ${id} not found`);
      }
    }
    console.error(`Failed to update name for user ID ${id}:`, error);
    throw new Error(
      `Failed to update user name: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
