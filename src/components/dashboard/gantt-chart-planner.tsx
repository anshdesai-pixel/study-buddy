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

    minDate.setDate(minDate.getDate());
    maxDate.setDate(maxDate.getDate());

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
    // Helper function to compare dates by day only
    const isSameDay = (date1: Date, date2: Date) => {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    };

    // Find the actual indices in the visible days array
    let startIndex = -1;
    let endIndex = -1;

    // Search for the exact match of start and end dates in visible days
    for (let i = 0; i < visibleDays.length; i++) {
      if (isSameDay(event.start_date, visibleDays[i]) && startIndex === -1) {
        startIndex = i;
      }
      if (isSameDay(event.deadline, visibleDays[i])) {
        endIndex = i;
      }
    }

    // Handle cases where the dates are outside the visible range
    if (startIndex === -1) {
      // If start date is before visible range, set to first visible day
      if (event.start_date < visibleDays[0]) {
        startIndex = 0;
      } else {
        // If start date is after the visible range, event is not visible
        return { start: 0, span: 0 };
      }
    }

    if (endIndex === -1) {
      // If end date is after visible range, set to last visible day
      if (event.deadline > visibleDays[visibleDays.length - 1]) {
        endIndex = visibleDays.length - 1;
      } else {
        // If end date is before the visible range, event is not visible
        return { start: 0, span: 0 };
      }
    }

    // Calculate the span ensuring it's at least 1
    const span = Math.max(1, endIndex - startIndex + 1);

    // Additional debug logging
    console.log(`Event: ${event.title || event.name}`, {
      start_date: event.start_date.toDateString(),
      deadline: event.deadline.toDateString(),
      startIndex,
      endIndex,
      span,
    });

    return {
      start: startIndex,
      span: span,
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
