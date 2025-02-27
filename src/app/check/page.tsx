"use client";
import { useUser } from "@stackframe/stack";

export default function MyClientComponent() {
  const user = useUser();
  return (
    <div>
      {user ? `Hello, ${user.displayName ?? "anon"}` : "You are not logged in"}
    </div>
  );
}
