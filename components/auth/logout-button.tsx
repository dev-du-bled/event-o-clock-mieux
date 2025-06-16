"use client";

import { authClient } from "@/lib/auth/auth-client";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface LogOutButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function LogOutButton({ onClick }: LogOutButtonProps) {
  const router = useRouter();
  const path = usePathname();

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(path);
        },
      },
    });
  };

  const buttonClick = () => {
    logout();
    if (onClick) onClick(); // for the ref so it close the menu
  };

  return (
    <button onClick={buttonClick} className="hover:cursor-pointer w-full">
      <span className="flex items-center">
        <LogOut className="mr-1 h-5 w-5" />
        Déconnexion
      </span>
    </button>
  );
}
