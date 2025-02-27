"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import useFcmToken from "@/hooks/use-fcm-token.hook";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ReminderNotification: React.FC = () => {
  const { token } = useFcmToken();
  const [isOpen, setIsOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState<string>("");
  const [reminderTime, setReminderTime] = useState<string>("");
  const [reminderTitle, setReminderTitle] = useState<string>("");
  const [reminderNote, setReminderNote] = useState<string>("");

  const handleTestNotification = async () => {
    if (!token) return;

    const response = await fetch("/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        title: reminderTitle || "Reminder Notification",
        message: reminderNote || "It's time for your reminder!",
        link: "/",
      }),
    });

    const data = await response.json();
    console.log(data);
  };

  const scheduleReminder = () => {
    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
    const currentTime = new Date();

    if (reminderDateTime <= currentTime) {
      toast.error("Please choose a time in the future.");
      return;
    }

    const timeUntilReminder =
      reminderDateTime.getTime() - currentTime.getTime();

    setTimeout(() => {
      handleTestNotification();
    }, timeUntilReminder);

    toast.success(`Reminder set for ${reminderDateTime.toLocaleString()}`);
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setReminderDate("");
    setReminderTime("");
    setReminderTitle("");
    setReminderNote("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 opacity-75 blur-sm group-hover:opacity-100 transition-opacity"></div>
              <Clock className="h-5 w-5 relative z-10 text-white" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Set a Reminder</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Set a Reminder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>
          <Input
            type="text"
            placeholder="Reminder Title"
            value={reminderTitle}
            onChange={(e) => setReminderTitle(e.target.value)}
          />
          <Textarea
            placeholder="Reminder Note"
            value={reminderNote}
            onChange={(e) => setReminderNote(e.target.value)}
            className="h-24"
          />
          <Button onClick={scheduleReminder}>Set Reminder</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderNotification;
