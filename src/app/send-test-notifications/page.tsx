"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import useFcmToken from "@/hooks/use-fcm-token.hook";

const Home: React.FC = () => {
  const { token, notificationPermissionStatus } = useFcmToken();
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
    const timeUntilReminder =
      reminderDateTime.getTime() - currentTime.getTime();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        handleTestNotification();
      }, timeUntilReminder);
      alert(`Reminder set for ${reminderDateTime.toString()}`);
    } else {
      alert("Please choose a time in the future.");
    }
  };

  return (
    <main className="p-10">
      <h1 className="text-4xl mb-4 font-bold">Firebase Cloud Messaging Demo</h1>

      {notificationPermissionStatus === "granted" ? (
        <p>Permission to receive notifications has been granted.</p>
      ) : notificationPermissionStatus !== null ? (
        <p>
          You have not granted permission to receive notifications. Please
          enable notifications in your browser settings.
        </p>
      ) : null}

      <div className="mt-5">
        <input
          type="date"
          value={reminderDate}
          onChange={(e) => setReminderDate(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Reminder Title"
          value={reminderTitle}
          onChange={(e) => setReminderTitle(e.target.value)}
          className="border p-2 mr-2"
        />
        <textarea
          placeholder="Reminder Note"
          value={reminderNote}
          onChange={(e) => setReminderNote(e.target.value)}
          className="border p-2 mr-2 w-full h-24"
        />
        <Button onClick={scheduleReminder}>Set Reminder</Button>
      </div>

      <Button
        disabled={!token}
        className="mt-5"
        onClick={handleTestNotification}
      >
        Send Test Notification
      </Button>
    </main>
  );
};

export default Home;
