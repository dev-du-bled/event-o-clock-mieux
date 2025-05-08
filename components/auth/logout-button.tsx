"use client";

import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogOutButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function LogOutButton({
  className,
  onClick,
}: LogOutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const buttonClick = () => {
    logout();
    if (onClick) onClick();
  };

  return (
    <button
      onClick={buttonClick}
      className={cn(
        "text-gray-600 hover:text-primary transition-colors cursor-pointer",
        className
      )}
    >
      <span className="flex items-center">
        <LogOut className="mr-1 h-5 w-5" />
        Déconnexion
      </span>
    </button>
  );
}
