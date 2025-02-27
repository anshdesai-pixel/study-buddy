export interface INote {
  id: string;
  title: string;
  content?: string | null | undefined;
}

export interface IPM {
  project: {
    id: string;
    name: string;
    description: string | null;
    start_date: Date;
    deadline: Date;
  };
}

export interface IProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ITaskMember {
  id: string;
  name: string;
  email: string;
  role: string;
}
