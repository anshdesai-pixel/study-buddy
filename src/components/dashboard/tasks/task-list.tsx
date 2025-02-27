/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import EditTaskForm from "./edit-task-form";
import DeleteTasksConfirmation from "./delete-task-confirmation";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddAssigneeForm from "./add-assignee-form";
import { Bell, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTaskMembersByTaskAction } from "@/app/_actions/task.actions";
import { ITaskMember } from "@/common/interface/dashboard.interface";
import { isTaskMemberAction } from "@/app/_actions/task-member.actions";
import { useUser } from "@stackframe/stack";

const TaskDeadlineNotification = ({
  task,
}: {
  task: { id: string; title: string; description: string; deadline: Date };
}) => {
  const addToGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const deadlineDate = new Date(task.deadline);
      const endDate = new Date(deadlineDate);
      endDate.setHours(deadlineDate.getHours() + 1);

      const startDate = deadlineDate.toISOString().replace(/-|:|\.\d+/g, "");
      const formattedEndDate = endDate.toISOString().replace(/-|:|\.\d+/g, "");
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        `Deadline: ${task.title}`
      )}&details=${encodeURIComponent(
        task.description || "Task deadline"
      )}&dates=${startDate}/${formattedEndDate}`;

      window.open(googleCalendarUrl, "_blank");
    } catch (error) {
      console.error("Error adding to Google Calendar:", error);
      toast.error("Failed to add event to Google Calendar");
    }
  };

  return (
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
  );
};

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

const TaskDetailDialog = ({
  task,
  isOpen,
  onClose,
  availableMembers,
  isFetching,
}: {
  task: {
    id: string;
    title: string;
    description: string;
    start_date: Date;
    deadline: Date;
    is_project_task: boolean;
    projectId?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  availableMembers: any[];
  isFetching: boolean;
}) => {
  const deadlineInfo = getDeadlineStatus(task.deadline);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-80px)] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle>{task.title}</DialogTitle>
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
              {task.description}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">StartDate</h4>
            <p className="text-sm text-gray-700">
              {task.start_date.toDateString()}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium mb-1">Deadline</h4>
              <p className="text-sm text-gray-700">
                {task.deadline.toDateString()}
              </p>
            </div>
            <TaskDeadlineNotification task={task} />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Assignees</h4>
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : availableMembers.length > 0 ? (
              <div className="flex space-x-2">
                {availableMembers.map((member, index) => (
                  <div
                    key={member.id + index}
                    className="flex items-center space-x-2"
                  >
                    <p className="text-sm text-gray-700">
                      {member.name || member.email}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No assignees yet.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function TaskList({
  allTasks,
  allProjects,
  userId,
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
}) {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(
    null
  );
  const [availableMembers, setAvailableMembers] = React.useState<any[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const user = useUser();
  const selectedTask = React.useMemo(
    () => allTasks.find((task) => task.id === selectedTaskId),
    [selectedTaskId, allTasks]
  );

  const fetchTaskMembers = async (taskId: string) => {
    setIsFetching(true);
    try {
      const taskMembersResponse = await getTaskMembersByTaskAction(taskId);
      const members = taskMembersResponse.data as unknown as ITaskMember[];

      // Use Promise.all to run all member checks in parallel
      const memberChecks = members.map(async (member) => {
        const isMemberResponse = await isTaskMemberAction(taskId, member.id);
        return isMemberResponse.data && member.id !== user?.id ? member : null;
      });

      // Wait for all promises to resolve
      const results = await Promise.all(memberChecks);

      // Filter out null values
      const available = results.filter(Boolean) as ITaskMember[];

      // Keep your original duplicate removal logic
      const removeDuplicate = available.filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );

      setAvailableMembers(removeDuplicate);
    } catch (error) {
      console.error("Failed to fetch task members:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    fetchTaskMembers(taskId);
  };

  return (
    <div className="relative space-y-4">
      {allTasks.map((task) => (
        <div
          key={task.id}
          className="border rounded-lg p-4 relative hover:shadow-md dark:shadow-blue-500/30 shadow-black/30 transition-shadow cursor-pointer duration-300"
          onClick={() => handleClick(task.id)}
        >
          <div className="text-lg font-semibold mb-2 flex space-x-2 items-center justify-between">
            <p>{task.title}</p>

            <div className="flex items-center space-x-2">
              <Badge variant={getDeadlineStatus(task.deadline).variant as any}>
                {getDeadlineStatus(task.deadline).label}
              </Badge>
              <p
                className={`text-xs uppercase ${
                  task.is_project_task ? "text-blue-500" : "text-gray-500"
                } rounded-full px-2`}
              >
                {task.is_project_task
                  ? allProjects.find((project) => project.id === task.projectId)
                      ?.name || "Unknown Project"
                  : "Personal Task"}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-2">
            {task.description.length > 50
              ? `${task.description.substring(0, 50)}...`
              : task.description}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Start: {task.start_date.toDateString()}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Due: {task.deadline.toDateString()}
          </p>

          <div
            className="flex space-x-2 justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <TaskDeadlineNotification task={task} />
            <div
              className={`flex space-x-2 ${userId !== task.userId && "hidden"}`}
            >
              {task.is_project_task && <AddAssigneeForm task={task} />}
              <EditTaskForm task={task} allProjects={allProjects} />
              <DeleteTasksConfirmation task={task} />
            </div>
          </div>
        </div>
      ))}

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          availableMembers={availableMembers}
          isFetching={isFetching}
        />
      )}
    </div>
  );
}
