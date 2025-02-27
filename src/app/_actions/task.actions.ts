"use server";

import {
  getAllTasks,
  getTaskById,
  getTasksByUserId,
  getUpcomingTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskMembers,
} from "@/services/task.service";
import {
  CreateTaskInput,
  UpdateTaskInput,
} from "@/common/types/request/task.types";
import { revalidateTasks } from "@/revalidations/dashboard/revalidate-dashboard";
import { addTaskMemberAction } from "./task-member.actions";

export async function getAllTasksAction() {
  try {
    const tasks = await getAllTasks();
    return { data: tasks, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch tasks",
    };
  }
}

export async function getTaskByIdAction(id: string) {
  try {
    const task = await getTaskById(id);
    return { data: task, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch task",
    };
  }
}

export async function getTasksByUserIdAction(userId: string) {
  try {
    const tasks = await getTasksByUserId(userId);
    return { data: tasks, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch user tasks",
    };
  }
}

export async function getUpcomingTasksAction(userId: string, days: number = 7) {
  try {
    const tasks = await getUpcomingTasks(userId, days);
    return { data: tasks, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch upcoming tasks",
    };
  }
}

export async function createTaskAction(data: CreateTaskInput) {
  try {
    const task = await createTask(data);
    await addTaskMemberAction({
      role: "admin",
      taskId: task.id,
      userId: task.userId,
    });
    revalidateTasks();
    return { data: task, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

export async function updateTaskAction(id: string, data: UpdateTaskInput) {
  try {
    const task = await updateTask(id, data);
    revalidateTasks();
    return { data: task, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    const task = await deleteTask(id);
    revalidateTasks();
    return { data: task, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}

export async function getTaskMembersByTaskAction(taskId: string) {
  try {
    const members = await getTaskMembers(taskId);
    return { data: members, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch task members",
    };
  }
}
