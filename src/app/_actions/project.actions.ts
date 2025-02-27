"use server";

import {
  getAllProjects,
  getProjectById,
  getProjectsByUserId,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
} from "@/services/project.service";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/common/types/request/project.types";
import { revalidateProjects } from "@/revalidations/dashboard/revalidate-dashboard";
import { addProjectMemberAction } from "./project-member.actions";

export async function getAllProjectsAction() {
  try {
    const projects = await getAllProjects();
    return { data: projects, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch projects",
    };
  }
}

export async function getProjectByIdAction(id: string) {
  try {
    const project = await getProjectById(id);
    return { data: project, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch project",
    };
  }
}

export async function getProjectsByUserIdAction(userId: string) {
  try {
    const projects = await getProjectsByUserId(userId);
    return { data: projects, error: null };
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

export async function createProjectAction(data: CreateProjectInput) {
  try {
    const project = await createProject(data);
    await addProjectMemberAction({
      role: "admin",
      projectId: project.id,
      userId: project.ownerId,
    });
    revalidateProjects();
    return { data: project, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

export async function updateProjectAction(
  id: string,
  data: UpdateProjectInput
) {
  try {
    const project = await updateProject(id, data);
    revalidateProjects();
    return { data: project, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to update project",
    };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const project = await deleteProject(id);
    revalidateProjects();
    return { data: project, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}

export async function getProjectMembersAction(projectId: string) {
  try {
    const members = await getProjectMembers(projectId);
    return { data: members, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch project members",
    };
  }
}
