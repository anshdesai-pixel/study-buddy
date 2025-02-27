export type CreateTaskInput = {
  title: string;
  description?: string | null;
  start_date: string;
  deadline: string;
  userId: string;
  projectId?: string | null;
  is_project_task: boolean;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  start_date?: string;
  deadline?: string;
  projectId?: string | null;
  is_project_task?: boolean;
};
