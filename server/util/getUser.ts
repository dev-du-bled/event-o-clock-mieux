"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Utilitaire pour récupérer l'utilisateur authentifié
 * Redirige vers la page de login si non authentifié
 */
export async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

/**
 * Utilitaire pour récupérer l'utilisateur authentifié
 * Optionnellement redirige vers la page de login si non authentifié
 */
export async function getUserWithoutRedirect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user || null;
}
