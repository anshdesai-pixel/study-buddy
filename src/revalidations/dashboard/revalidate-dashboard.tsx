import { revalidatePath } from "next/cache";

export async function revalidateNotes() {
  revalidatePath("/dashboard/notes");
}

export async function revalidateTasks() {
  revalidatePath("/dashboard/tasks");
}

export async function revalidateProjects() {
  revalidatePath("/dashboard/project");
}

export async function revalidateUsers() {
  revalidatePath("/users");
}
