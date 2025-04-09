import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export default function LogOutButton() {
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

  return (
    <button
      onClick={logout}
      className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
    >
      Déconnexion
    </button>
  );
}
