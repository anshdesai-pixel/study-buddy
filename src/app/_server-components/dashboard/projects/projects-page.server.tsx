/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getAllUsersAction,
  getUserProjectsAction,
} from "@/app/_actions/user.actions";
import ProjectsPageClient from "@/components/dashboard/projects/projects-page.client";
import { stackServerApp } from "@/lib/stack";
import React from "react";

const ProjectsPageServer = async () => {
  const user = await stackServerApp.getUser();

  const allProjects = await getUserProjectsAction(user ? user.id : "");

  const allUsers = await getAllUsersAction();
  return (
    <div>
      <ProjectsPageClient
        allProjects={
          allProjects.data?.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            start_date: project.start_date,
            deadline: project.deadline,
            userId: project.ownerId,
          })) || []
        }
        userId={user ? user.id : ""}
        allUsers={
          allUsers.data?.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.name,
          })) || []
        }
      />
    </div>
  );
};
export default ProjectsPageServer;
