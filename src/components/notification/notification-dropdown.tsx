"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// This is a mock function to simulate fetching notifications
// Replace this with actual data fetching logic in a real application
const getNotifications = () => [
  { id: 1, message: "New task assigned: Complete project proposal" },
  { id: 2, message: "Reminder: Team meeting in 30 minutes" },
  { id: 3, message: "Task due tomorrow: Submit quarterly report" },
];

export function NotificationDropdown() {
  const [notifications, setNotifications] = React.useState<
    { id: number; message: string }[]
  >([]);

  React.useEffect(() => {
    // Simulating an API call to fetch notifications
    setNotifications(getNotifications());
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <DropdownMenuItem>No new notifications</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id}>
              {notification.message}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
