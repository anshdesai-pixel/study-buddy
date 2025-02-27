export type CreateNoteInput = {
  title: string;
  content?: string | null;
  userId: string;
};

export type UpdateNoteInput = {
  title?: string;
  content?: string | null;
};
