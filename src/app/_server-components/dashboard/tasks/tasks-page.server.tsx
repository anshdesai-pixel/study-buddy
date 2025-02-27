/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getUserProjectsAction,
  getUserTasksAction,
} from "@/app/_actions/user.actions";
import TasksPageClient from "@/components/dashboard/tasks/tasks-page.client";
import { stackServerApp } from "@/lib/stack";
import React from "react";

const TasksPageServer = async () => {
  const user = await stackServerApp.getUser();

  const allTasks = await getUserTasksAction(user ? user.id : "");
  const allProjects = await getUserProjectsAction(user ? user.id : "");

  return (
    <div>
      <TasksPageClient
        allTasks={
          allTasks.data?.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description || "",
            start_date: task.start_date,
            deadline: task.deadline,
            is_project_task: task.is_project_task,
            projectId: task.projectId || "",
            userId: task.userId,
          })) || []
        }
        allProjects={
          allProjects.data?.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description || "",
            start_date: project.start_date,
            deadline: project.deadline,
          })) || []
        }
        userId={user ? user.id : ""}
      />
    </div>
  );
};
export default TasksPageServer;
