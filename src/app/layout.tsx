import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../lib/stack";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme.provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Navbar } from "@/components/base/navbar.client";
import { Toaster } from "sonner";
import ReminderNotification from "@/components/base/reminder-notification";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Buddy",
  description: "Your personal study management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider delayDuration={300}>
                <SidebarProvider>
                  <Toaster richColors position="bottom-left" />
                  <div className="flex h-screen bg-background w-full">
                    <div className="flex flex-col flex-1">
                      <Navbar />
                      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
                        {children}
                        <div className="fixed bottom-4 right-4">
                          <ReminderNotification />
                        </div>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </TooltipProvider>
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
