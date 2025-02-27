/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { getUserTasksAction } from "@/app/_actions/user.actions";
import { getUserProjectsAction } from "@/app/_actions/user.actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TimetablePlanner({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<
    {
      id: string;
      title: string;
      userId: string;
      description: string | null;
      start_date: Date;
      deadline: Date;
      projectId?: string | null;
      is_project_task: boolean;
    }[]
  >([]);
  const [projects, setProjects] = useState<
    {
      id: string;
      name: string;
      description: string | null;
      start_date: Date;
      deadline: Date;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  const fetchData = async (date: Date) => {
    setLoading(true);
    try {
      const [tasksResult, projectsResult] = await Promise.all([
        getUserTasksAction(userId),
        getUserProjectsAction(userId),
      ]);

      if (tasksResult.data) {
        const tasksWithValidProjectTask = tasksResult.data.map((task: any) => ({
          ...task,
          is_project_task: task.is_project_task ?? false,
        }));
        setTasks(tasksWithValidProjectTask);
      }
      if (projectsResult.data) {
        const allProjects = (projectsResult.data || []).map((project) => ({
          ...project,
          type: "project" as const,
          start_date: new Date(project?.start_date ?? ""),
          deadline: new Date(project?.deadline ?? ""),
          id: project?.id || "",
          name: project?.name || "",
          description: project?.description || "", // Add this line to ensure 'description' is always a string
        }));
        setProjects(allProjects);
      }
      generateCalendarDays(date);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentDate);
  }, [userId, currentDate]);

  const generateCalendarDays = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDay = start.getDay();
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();

    const days = [];
    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() - (firstDay - i));
      days.push(day);
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }
    // Next month days to complete the grid
    const remainingDays = 42 - days.length;
    const lastDay = new Date(date.getFullYear(), date.getMonth(), daysInMonth);
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(lastDay);
      day.setDate(lastDay.getDate() + i);
      days.push(day);
    }

    setCalendarDays(days);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  const isEventOnDate = (eventDate: Date, currentDate: Date) => {
    return formatDate(eventDate) === formatDate(currentDate);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex gap-2">
            <button disabled className="p-1 opacity-50 cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button disabled className="p-1 opacity-50 cursor-not-allowed">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center py-2 text-gray-500 font-medium"
            >
              {day}
            </div>
          ))}
          {Array(42)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="border-t p-1 h-16 animate-pulse bg-gray-200 dark:bg-gray-800"
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-1 dark:hover:bg-gray-100/20 hover:bg-black/40 rounded"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-1 hover:bg-black/40 dark:hover:bg-gray-100/20 rounded"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center py-2 text-gray-500 font-medium">
            {day}
          </div>
        ))}

        {calendarDays.map((date, index) => {
          const dayEvents = [
            ...tasks.filter((task) =>
              isEventOnDate(new Date(task.deadline), date)
            ),
            ...projects.filter((project) =>
              isEventOnDate(new Date(project.deadline), date)
            ),
          ];

          return (
            <div
              key={index}
              className={`border-t p-1 h-[72px] ${
                isCurrentMonth(date)
                  ? "bg-background"
                  : "bg-gray-200 dark:bg-gray-900"
              } ${isToday(date) ? "border border-blue-200" : ""}`}
            >
              <div
                className={`text-right mb-1 ${
                  isCurrentMonth(date)
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1 h-8 overflow-y-auto">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <TooltipProvider key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={
                            event.hasOwnProperty("title")
                              ? "/dashboard/tasks"
                              : "/dashboard/projects"
                          }
                          className={`block text-xs p-1 rounded truncate ${
                            event.hasOwnProperty("title")
                              ? "bg-blue-300 text-blue-800"
                              : "bg-green-300 text-green-800"
                          }`}
                        >
                          {(event as any).title || (event as any).name}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="p-1">
                          <div className="font-medium">
                            {(event as any).title || (event as any).name}
                          </div>
                          <div className="text-xs mt-1">
                            {(event as any).description?.substring(0, 50) ||
                              "No description"}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
