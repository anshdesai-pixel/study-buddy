import { db } from "@/db/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateProjectMemberInput,
  UpdateProjectMemberInput,
} from "@/common/types/request/project-member.types";

export const getMemberById = async (id: string) => {
  try {
    return await db.project_member.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Failed to get project member with ID ${id}:`, error);
    throw new Error(
      `Failed to get project member: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getProjectMembers = async (projectId: string) => {
  try {
    return await db.project_member.findMany({
      where: { projectId },
      include: {
        users_sync: true,
      },
    });
  } catch (error) {
    console.error(`Failed to get members for project ID ${projectId}:`, error);
    throw new Error(
      `Failed to get project members: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const getUserMemberships = async (userId: string) => {
  try {
    return await db.project_member.findMany({
      where: { userId },
      include: {
        project: true,
      },
    });
  } catch (error) {
    console.error(`Failed to get memberships for user ID ${userId}:`, error);
    throw new Error(
      `Failed to get user memberships: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const addMember = async (data: CreateProjectMemberInput) => {
  try {
    return await db.project_member.create({
      data: data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("This user is already a member of the project");
      } else if (error.code === "P2003") {
        if (
          error.meta?.field_name &&
          typeof error.meta.field_name === "string"
        ) {
          if (error.meta.field_name.includes("projectId")) {
            throw new Error("The referenced project does not exist");
          } else if (error.meta.field_name.includes("userId")) {
            throw new Error("The referenced user does not exist");
          }
        }
      }
    }
    console.error("Failed to add project member:", error);
    throw new Error(
      `Failed to add project member: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const updateMember = async (
  id: string,
  data: UpdateProjectMemberInput
) => {
  try {
    return await db.project_member.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Project member with ID ${id} not found`);
      }
    }
    console.error(`Failed to update project member with ID ${id}:`, error);
    throw new Error(
      `Failed to update project member: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const removeMember = async (id: string) => {
  try {
    return await db.project_member.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(`Project member with ID ${id} not found`);
      }
    }
    console.error(`Failed to remove project member with ID ${id}:`, error);
    throw new Error(
      `Failed to remove project member: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const isMember = async (projectId: string, userId: string) => {
  try {
    const member = await db.project_member.findFirst({
      where: {
        projectId,
        userId,
      },
    });
    return !!member;
  } catch (error) {
    console.error(
      `Failed to check membership for project ${projectId} and user ${userId}:`,
      error
    );
    throw new Error(
      `Failed to check membership: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
