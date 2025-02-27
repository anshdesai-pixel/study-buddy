import { Bell } from "lucide-react";

const notifications = [
  { id: 1, message: "Project proposal due tomorrow" },
  { id: 2, message: "Team meeting in 1 hour" },
  { id: 3, message: "New task assigned: Review documentation" },
];

export default function NotificationList() {
  return (
    <ul className="space-y-4">
      {notifications.map((notification) => (
        <li key={notification.id} className="flex items-center space-x-2">
          <Bell className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{notification.message}</span>
        </li>
      ))}
    </ul>
  );
}
