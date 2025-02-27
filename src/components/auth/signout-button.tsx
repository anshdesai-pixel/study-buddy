"use client";
import { useUser } from "@stackframe/stack";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

export default function SignOutButton() {
  const user = useUser();
  return user ? (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => user.signOut()}
        className="w-full sm:w-auto text-red-600"
      >
        {user.profileImageUrl && (
          <Image
            src={user.profileImageUrl}
            alt="User Profile"
            width={24}
            height={24}
            className="w-6 h-6 rounded-full"
          />
        )}
        <LogOut className="h-4 w-4" />
      </Button>
    </>
  ) : (
    "Not signed in"
  );
}
