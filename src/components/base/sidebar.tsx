"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChartGantt,
  FolderGit2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const routes = [
  { title: "Tasks", href: "/dashboard/tasks", icon: BookOpen },
  { title: "Timetable", href: "/dashboard/timetable", icon: Calendar },
  { title: "Gantt Chart", href: "/dashboard/gantt-chart", icon: ChartGantt },
  { title: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
  { title: "Notes", href: "/dashboard/notes", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-background border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={`absolute bottom-1 left-1 flex items-center p-2 z-50`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-2">
          {routes.map((route) =>
            isCollapsed ? (
              <Tooltip key={route.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center px-2 rounded-lg transition-all duration-300 ease-in-out justify-center py-3",
                      pathname === route.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{route.title}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center px-2 py-2 rounded-lg transition-all duration-300 ease-in-out",
                  pathname === route.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                <span className="ml-2 text-sm">{route.title}</span>
              </Link>
            )
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
