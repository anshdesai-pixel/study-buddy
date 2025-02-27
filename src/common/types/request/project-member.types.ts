export type CreateProjectMemberInput = {
  role: string;
  projectId: string;
  userId: string;
};

export type UpdateProjectMemberInput = {
  role?: string;
};
