import { db } from "@/db/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/common/types/request/project.types";

export const getAllProjects = async () => {
  try {
    return await db.project.findMany();
  } catch (error) {
    console.error("Failed to get all projects:", error);
    throw new Error(
      `Failed to get all projects: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getProjectById = async (id: string) => {
  try {
    return await db.project.findUnique({
      where: { id },
      include: {
        project_member: true,
      },
    });
  } catch (error) {
    console.error(`Failed to get project with ID ${id}:`, error);
    throw new Error(
      `Failed to get project: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getProjectsByUserId = async (userId: string) => {
  try {
    const ownedProjects = await db.project.findMany({
      where: { ownerId: userId },
    });

    const memberProjects = await db.project.findMany({
      where: {
        project_member: {
          some: { userId },
        },
      },
    });

    return [...ownedProjects, ...memberProjects];
  } catch (error) {
    console.error(`Failed to get projects for user ID ${userId}:`, error);
    throw new Error(
      `Failed to get user projects: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getProjectMembers = async (projectId: string) => {
  try {
    const members = await db.project_member.findMany({
      where: { projectId },
      include: {
        users_sync: true,
      },
    });

    // Map directly to the required format
    return members.map((member) => ({
      id: member.id,
      name: member.users_sync.name,
      email: member.users_sync.email,
      role: member.role,
    }));
  } catch (error) {
    console.error(`Failed to get members for project ID ${projectId}:`, error);
    throw new Error(
      `Failed to get project members: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const createProject = async (data: CreateProjectInput) => {
  try {
    return await db.project.create({
      data: data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A project with this identifier already exists");
      } else if (error.code === "P2003") {
        throw new Error("The referenced owner does not exist");
      }
    }
    console.error("Failed to create project:", error);
    throw new Error(
      `Failed to create project: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const updateProject = async (id: string, data: UpdateProjectInput) => {
  try {
    return await db.project.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Project with ID ${id} not found`);
      }
    }
    console.error(`Failed to update project with ID ${id}:`, error);
    throw new Error(
      `Failed to update project: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const deleteProject = async (id: string) => {
  try {
    return await db.project.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Project with ID ${id} not found`);
      } else if (error.code === "P2003") {
        throw new Error("Cannot delete project with associated members");
      }
    }
    console.error(`Failed to delete project with ID ${id}:`, error);
    throw new Error(
      `Failed to delete project: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
