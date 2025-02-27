"use server";

import {
  getMemberById,
  getProjectMembers,
  getUserMemberships,
  addMember,
  updateMember,
  removeMember,
} from "@/services/project-member.service";
import {
  CreateProjectMemberInput,
  UpdateProjectMemberInput,
} from "@/common/types/request/project-member.types";
import {
  revalidateNotes,
  revalidateProjects,
  revalidateTasks,
} from "@/revalidations/dashboard/revalidate-dashboard";

export async function getMemberByIdAction(id: string) {
  try {
    const member = await getMemberById(id);
    return { data: member, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch project member",
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

export async function getUserMembershipsAction(userId: string) {
  try {
    const memberships = await getUserMemberships(userId);
    return { data: memberships, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user memberships",
    };
  }
}

export async function addProjectMemberAction(data: CreateProjectMemberInput) {
  try {
    const member = await addMember(data);
    revalidateNotes();
    revalidateProjects();
    revalidateTasks();
    return { data: member, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to add project member",
    };
  }
}

export async function updateMemberAction(
  id: string,
  data: UpdateProjectMemberInput
) {
  try {
    const member = await updateMember(id, data);
    revalidateNotes();
    revalidateProjects();
    return { data: member, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update project member",
    };
  }
}

export async function removeMemberAction(id: string) {
  try {
    const member = await removeMember(id);
    revalidateNotes();
    revalidateProjects();
    return { data: member, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove project member",
    };
  }
}
