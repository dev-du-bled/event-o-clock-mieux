"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Utilitaire pour récupérer l'utilisateur authentifié
 * Redirige vers la page de login si non authentifié
 */
export async function getUser(shouldRedirect?: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (shouldRedirect || !session?.user) {
    redirect("/login");
  }

  return session.user;
}
