/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getUserTasksAction,
  getUserProjectsAction,
} from "@/app/_actions/user.actions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title?: string;
  name?: string;
  description: string | null;
  start_date: Date;
  deadline: Date;
  type: "task" | "project";
}

export default function GanttChartPlanner({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysArray, setDaysArray] = useState<Date[]>([]);
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksResult, projectsResult] = await Promise.all([
        getUserTasksAction(userId),
        getUserProjectsAction(userId),
      ]);

      const tasks =
        (tasksResult.data || []).map((task: any) => ({
          ...task,
          type: "task" as const,
          start_date: new Date(task.start_date),
          deadline: new Date(task.deadline),
        })) || [];

      const allProjects = (projectsResult.data || []).map((project) => ({
        ...project,
        type: "project" as const,
        start_date: new Date(project?.start_date ?? ""),
        deadline: new Date(project?.deadline ?? ""),
      }));

      // Combine and remove duplicates using Map
      const allEvents = [...tasks, ...allProjects];
      const uniqueEvents = Array.from(
        new Map(allEvents.map((event) => [event.id, event])).values()
      );

      console.log(
        "Unique Event IDs:",
        uniqueEvents.map((event) => event.id)
      ); // Debugging

      setEvents(uniqueEvents);
      generateTimelineArray(uniqueEvents);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const generateTimelineArray = (events: Event[]) => {
    let minDate = new Date();
    let maxDate = new Date();

    events.forEach((event) => {
      if (event.start_date < minDate) minDate = event.start_date;
      if (event.deadline > maxDate) maxDate = event.deadline;
    });

    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    const days: Date[] = [];
    const currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setDaysArray(days);
    setVisibleDays(days.slice(0, 14));
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getEventSpan = (event: Event) => {
    const firstVisibleDate = visibleDays[0];
    const lastVisibleDate = visibleDays[visibleDays.length - 1];

    // Ensure the event's start and end dates are within the visible range
    const startDate =
      event.start_date < firstVisibleDate ? firstVisibleDate : event.start_date;
    const endDate =
      event.deadline > lastVisibleDate ? lastVisibleDate : event.deadline;

    const startIndex = visibleDays.findIndex(
      (date) => date.toDateString() === startDate.toDateString()
    );
    const endIndex = visibleDays.findIndex(
      (date) => date.toDateString() === endDate.toDateString()
    );

    // If the event is not within the visible range, return a span of 0
    if (startIndex === -1 || endIndex === -1) {
      return { start: 0, span: 0 };
    }

    return {
      start: startIndex,
      span: endIndex - startIndex + 1,
    };
  };

  const handlePrevious = () => {
    if (currentStartIndex > 0) {
      const newStartIndex = Math.max(0, currentStartIndex - 7);
      setCurrentStartIndex(newStartIndex);
      setVisibleDays(daysArray.slice(newStartIndex, newStartIndex + 14));
    }
  };

  const handleNext = () => {
    if (currentStartIndex + 14 < daysArray.length) {
      const newStartIndex = currentStartIndex + 7;
      setCurrentStartIndex(newStartIndex);
      setVisibleDays(daysArray.slice(newStartIndex, newStartIndex + 14));
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-64 animate-pulse bg-gray-200 dark:bg-black rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 overflow-x-auto bg-background rounded-lg">
      <div className="min-w-[800px] w-full">
        <div className="flex justify-end items-center mb-4">
          <div className="flex space-x-2">
            <Button onClick={handlePrevious} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={handleNext} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex">
          <div className="w-48 flex-shrink-0 p-2 font-medium">
            Tasks & Projects
          </div>
          <div className="flex-1 flex">
            {visibleDays.map((date, index) => (
              <div
                key={index}
                className={cn(
                  "w-12 flex-shrink-0 text-center text-xs p-1",
                  isToday(date) &&
                    "bg-blue-100 dark:bg-blue-900 font-bold text-blue-600 dark:text-blue-300 rounded-t-md"
                )}
              >
                {formatDate(date)}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {events.map((event, index) => {
            const { start, span } = getEventSpan(event);
            return (
              <div key={`${event.id}-${index}`} className="flex relative">
                <div
                  className={`w-48 p-2 border-t text-xs rounded ${
                    event.type === "task"
                      ? "bg-gradient-to-r from-blue-400/20 to-blue-600/20"
                      : "bg-gradient-to-r from-green-400/20 to-green-600/20"
                  }`}
                >
                  {event.title || event.name}
                </div>
                <div className="flex-1 flex border-t relative">
                  <div
                    className={cn(
                      "absolute h-6 rounded-md top-1 transition-all flex items-center justify-center text-white",
                      event.type === "task"
                        ? "bg-gradient-to-r from-blue-400 to-blue-600"
                        : "bg-gradient-to-r from-green-400 to-green-600"
                    )}
                    style={{ left: `${start * 48}px`, width: `${span * 48}px` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
