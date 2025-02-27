"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import ProjectList from "./project-list";
import CreateProjectForm from "./create-project-form";

const ProjectsPageClient = ({
  allProjects,
  userId,
  allUsers,
}: {
  allProjects: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
    userId: string;
  }[];
  userId: string;
  allUsers: {
    id: string;
    email: string;
    name: string;
  }[];
}) => {
  return (
    <Card className="border-0 shadow-none p-0 m-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <CreateProjectForm userId={userId} allUsers={allUsers} />
      </CardHeader>
      <CardContent>
        {allProjects.length === 0 ? (
          <div className="text-center text-gray-500">
            No projects found. Add a new project to get started.
          </div>
        ) : (
          <ProjectList
            allProjects={allProjects}
            allUsers={allUsers}
            userId={userId}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsPageClient;
