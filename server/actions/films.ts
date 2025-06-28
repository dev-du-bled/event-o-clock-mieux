"use server";
import { Movie } from "@/types/types";
import { searchTMDB, getMovieDetails } from "@/lib/tmdb";

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
    console.error("Erreur recherche des films:", error);
    return {
      success: false,
      message: "Impossible de chercher les films",
    };
  }
}

/**
 * Action pour recuperer les données d'un films
 */
export async function getFilmAction(
  movieid: string
): Promise<ServerActionResult> {
  try {
    const movieDetails = await getMovieDetails(movieid);

    return {
      success: true,
      results: [movieDetails],
    };
  } catch (error) {
    console.error("Erreur récupération film:", error);
    return {
      success: false,
      message: "Impossible de récupérer le film",
    };
  }
}
