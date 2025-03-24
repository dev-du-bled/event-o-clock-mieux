const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/**
 * Type definition for a Movie object, which describes the details of a movie.
 */
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
}

/**
 * Type definition for a MovieVideo object, which holds information about a movie video (e.g., trailer).
 */
export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

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
export async function getMovieDetails(movieId: number): Promise<Movie> {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?language=fr-FR`,
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du film:", error);
    throw new Error("Impossible de charger les détails du film");
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
