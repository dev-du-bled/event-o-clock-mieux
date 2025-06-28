import { Movie } from "@/types/types";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.NEXT_TMDB_API_KEY}`,
  },
};

/**
 * Fetches the details of a movie from the TMDb API.
 *
 * @param movieId - The unique ID of the movie to fetch details for.
 * @returns A promise that resolves to a Movie object containing the details of the movie.
 * @throws Error - If there’s an error with the API request or if the movie details cannot be loaded.
 */
export async function getMovieDetails(movieId: string): Promise<Movie> {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?language=fr-FR`,
      options
    );

    console.log(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du film:", error);
    throw new Error("Impossible de charger les détails du film");
  }
}

export async function searchTMDB(query: string): Promise<[Movie]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?query=${query}`,
      options
    );

    if (response.status === 401) throw Error("401 Unauthorized");

    const movies = await response.json();
    return movies.results;
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    throw new Error("Impossible de chercher des films");
  }
}

/**
 * Generates a URL for the image based on the provided path and size.
 *
 * @param path - The path to the image (can be null if no image is provided).
 * @param size - The size of the image (defaults to 'original').
 * @returns A string URL pointing to the image file.
 */
export function getImageUrl(
  path: string | null,
  size: string = "original"
): string {
  // Update return type to Promise<string>
  if (!path) {
    return "/placeholder-movie.jpg";
  }
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
