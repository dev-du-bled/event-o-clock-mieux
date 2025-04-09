"use client";

import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function LogOutButton(props: { className?: string }) {
  const router = useRouter();

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh(); // to update header
        },
      },
    });
  };

  return (
    <button
      onClick={logout}
      className={cn(
        "text-gray-600 hover:text-primary transition-colors cursor-pointer",
        props.className
      )}
    >
      Déconnexion
    </button>
  );
}
