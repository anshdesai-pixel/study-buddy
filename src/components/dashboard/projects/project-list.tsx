/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditProjectForm from "./edit-project-form";
import DeleteProjectConfirmation from "./delete-project-confirmation";
import { getProjectMembersAction } from "@/app/_actions/project-member.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ProjectMember {
  userId: string;
  role: string;
}

// Deadline notification component
const ProjectDeadlineNotification = ({
  project,
}: {
  project: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
  };
}) => {
  const addToGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    try {
      const deadlineDate = new Date(project.deadline);
      const endDate = new Date(deadlineDate);
      endDate.setHours(deadlineDate.getHours() + 1); // Default to a 1-hour event

      // Format dates for Google Calendar URL
      const startDate = deadlineDate.toISOString().replace(/-|:|\.\d+/g, "");
      const formattedEndDate = endDate.toISOString().replace(/-|:|\.\d+/g, "");

      // Create Google Calendar URL
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        `Deadline: ${project.name}`
      )}&details=${encodeURIComponent(
        project.description || "Project deadline"
      )}&dates=${startDate}/${formattedEndDate}`;

      // Open the URL in a new window
      window.open(googleCalendarUrl, "_blank");
    } catch (error) {
      console.error("Error adding to Google Calendar:", error);
      toast.error("Failed to add event to Google Calendar");
    }
  };

  return (
    <div className="flex space-x-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={addToGoogleCalendar}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to Google Calendar</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

// Helper function to calculate deadline status
const getDeadlineStatus = (deadline: Date) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: "overdue", label: "Overdue", variant: "destructive" };
  } else if (diffDays === 0) {
    return { status: "today", label: "Due Today", variant: "warning" };
  } else if (diffDays === 1) {
    return { status: "tomorrow", label: "Due Tomorrow", variant: "warning" };
  } else if (diffDays <= 7) {
    return {
      status: "upcoming",
      label: `${diffDays} days left`,
      variant: "default",
    };
  } else {
    return {
      status: "future",
      label: `${diffDays} days left`,
      variant: "secondary",
    };
  }
};

const ProjectDetailDialog = ({
  project,
  isOpen,
  onClose,
  members,
  allUsers,
}: {
  project: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
  };
  isOpen: boolean;
  onClose: () => void;
  members: ProjectMember[];
  allUsers: {
    id: string;
    email: string;
    name: string;
  }[];
}) => {
  const memberDetails = members
    .map((member) => allUsers.find((user) => user.id === member.userId))
    .filter(Boolean) as { name: string; email: string }[];

  const deadlineInfo = getDeadlineStatus(project.deadline);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-80px)] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle>{project.name}</DialogTitle>
            <div className="flex items-center space-x-2 mr-4">
              <Badge variant={deadlineInfo.variant as any}>
                {deadlineInfo.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {project.description}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Start Date</h4>
            <p className="text-sm text-gray-700">
              {project.start_date.toDateString()}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium mb-1">Deadline</h4>
              <p className="text-sm text-gray-700">
                {project.deadline.toDateString()}
              </p>
            </div>
            <ProjectDeadlineNotification project={project} />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Project Members</h4>
            {memberDetails.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-700">
                {memberDetails.map((member, index) => (
                  <li key={index}>
                    <span className="font-medium">{member.name}</span> -{" "}
                    <span className="text-gray-600">{member.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700">No members assigned</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProjectCard = ({
  project,
  allUsers,
  onSelect,
  projectMembers,
  onMembersUpdated,
  userId,
}: {
  project: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
    userId: string;
  };
  allUsers: {
    id: string;
    email: string;
    name: string;
  }[];
  onSelect: () => void;
  projectMembers: ProjectMember[];
  onMembersUpdated: () => void;
  userId: string;
}) => {
  const deadlineInfo = getDeadlineStatus(project.deadline);

  return (
    <div
      className="border rounded-lg p-4 relative hover:shadow-md dark:shadow-blue-500/30 shadow-black/30 transition-shadow cursor-pointer duration-300"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <Badge variant={deadlineInfo.variant as any}>
          {deadlineInfo.label}
        </Badge>
      </div>
      <p className="text-sm text-gray-500 mb-2">
        {project.description && project.description.length > 50
          ? `${project.description.substring(0, 50)}...`
          : project.description}
      </p>
      <p className="text-sm text-gray-500 mb-2">
        Start: {project.start_date.toDateString()}
      </p>
      <p className="text-sm text-gray-500 mb-2">
        Due: {project.deadline.toDateString()}
      </p>
      <div
        className="flex justify-between items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <ProjectDeadlineNotification project={project} />
        <div
          className={`flex space-x-2 ${userId !== project.userId && "hidden"}`}
        >
          <EditProjectForm
            project={project}
            allUsers={allUsers}
            currentMembers={projectMembers.map((member) => member.userId)}
            onMembersUpdated={onMembersUpdated}
          />
          <DeleteProjectConfirmation project={project} />
        </div>
      </div>
    </div>
  );
};

export default function ProjectList({
  allProjects,
  allUsers,
  userId,
}: {
  allProjects: {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    deadline: Date;
    userId: string;
  }[];
  allUsers: {
    id: string;
    email: string;
    name: string;
  }[];
  userId: string;
}) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<
    string | null
  >(null);
  const [projectMembers, setProjectMembers] = React.useState<{
    [key: string]: ProjectMember[];
  }>({});

  const selectedProject = allProjects.find(
    (project) => project.id === selectedProjectId
  );

  // Fetch project members when component mounts or when allProjects changes
  const fetchProjectMembers = React.useCallback(async (projectId: string) => {
    try {
      const response = await getProjectMembersAction(projectId);
      if (response.error) {
        console.error("Error fetching members:", response.error);
        return;
      }

      const members: ProjectMember[] = response.data
        ? response.data.map((member) => ({
            userId: member.users_sync.id,
            role: "member",
          }))
        : [];

      setProjectMembers((prev) => ({
        ...prev,
        [projectId]: members,
      }));
    } catch (error) {
      console.error("Failed to fetch project members:", error);
    }
  }, []);

  // Refresh members for a specific project
  const refreshProjectMembers = React.useCallback(
    (projectId: string) => {
      fetchProjectMembers(projectId);
    },
    [fetchProjectMembers]
  );

  React.useEffect(() => {
    allProjects.forEach((project) => {
      fetchProjectMembers(project.id);
    });
  }, [allProjects, fetchProjectMembers]);

  return (
    <div className="relative space-y-4">
      {allProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          allUsers={allUsers}
          onSelect={() => setSelectedProjectId(project.id)}
          projectMembers={projectMembers[project.id] || []}
          onMembersUpdated={() => refreshProjectMembers(project.id)}
          userId={userId}
        />
      ))}

      {selectedProject && (
        <ProjectDetailDialog
          project={selectedProject}
          isOpen={!!selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
          members={projectMembers[selectedProject.id] || []}
          allUsers={allUsers}
        />
      )}
    </div>
  );
}
