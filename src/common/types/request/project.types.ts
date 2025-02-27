export type CreateProjectInput = {
  name: string;
  description?: string | null;
  ownerId: string;
  start_date: string;
  deadline: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  start_date?: string;
  deadline?: string;
};
