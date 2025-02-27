"use cient";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import TaskList from "./task-list";
import CreateTaskForm from "./create-task-form";

const TasksPageClient = ({
  allTasks,
  userId,
  allProjects,
}: {
  allTasks: {
    id: string;
    title: string;
    description: string;
    start_date: Date;
    deadline: Date;
    projectId?: string | null;
    is_project_task: boolean;
    userId: string;
  }[];
  allProjects: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
  }[];
  userId: string;
}) => {
  return (
    <Card className="border-0 shadow-none p-0 m-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks</CardTitle>
        <CreateTaskForm userId={userId} allProjects={allProjects} />
      </CardHeader>
      <CardContent>
        {allTasks.length === 0 ? (
          <div className="text-center text-gray-500">
            No tasks found. Add a new task to get started.
          </div>
        ) : (
          <TaskList
            allTasks={allTasks}
            allProjects={allProjects}
            userId={userId}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TasksPageClient;
