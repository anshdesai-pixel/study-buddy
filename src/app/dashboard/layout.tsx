import type React from "react";
import { Sidebar } from "@/components/base/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full bg-background w-full">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
