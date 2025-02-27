"use client";

import * as React from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@stackframe/stack";
import SignOutButton from "../auth/signout-button";

// Separate user-dependent content into its own component
const UserSection = () => {
  const user = useUser();
  const isLoggedIn = !!user;

  return isLoggedIn ? (
    <>
      <SignOutButton />
    </>
  ) : (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href="/handler/sign-in">Log In</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/handler/sign-up">Sign Up</Link>
      </Button>
    </>
  );
};

export function Navbar() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold">
          Study Buddy
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <React.Suspense
          fallback={
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" disabled>
                Loading...
              </Button>
            </div>
          }
        >
          <UserSection />
        </React.Suspense>
      </div>
    </nav>
  );
}
