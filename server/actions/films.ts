"use server";
import { Movie } from "@/lib/tmdb";
import { searchTMDB } from "@/lib/tmdb";

type ServerActionResult = {
  success: boolean;
  results?: [Movie];
  message?: string;
};

/**
 * Action pour chercher des films
 */
export async function searchFilmsAction(
  query: string
): Promise<ServerActionResult> {
  try {
    const searchResults = await searchTMDB(query);

    return {
      success: true,
      results: searchResults,
    };
  } catch (error) {
    console.error("Erreur création salle:", error);
    return {
      success: false,
      message: "Impossible de chercher les films",
    };
  }
}
