export type CreateTaskMemberInput = {
  role: string;
  taskId: string;
  userId: string;
};

export type UpdateTaskMemberInput = {
  role?: string;
};
