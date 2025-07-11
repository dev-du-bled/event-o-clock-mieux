export interface AddressData {
  properties: {
    label: string;
    city: string;
    name: string; // full street address with number
    postcode: string;
  };
}

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

export interface CityFeature {
  properties: {
    city: string;
    postcode: string;
    context: string;
  };
}

export type mapType = {
  image?: {
    name: string;
    data: string;
  };
  svg?: {
    name: string;
    data: string;
  };
};

export type movieSchedule = {
  movieId: string;
  showtime: string;
};

/**
 * @brief Cinema room configuration
 * @details Defines the layout parameters for cinema rooms
 */
export const ROOM_CONFIG = {
  rows: 5,
  seatsPerRow: 8,
};

/**
 * @brief Default ticket prices by category
 * @details Defines pricing for different ticket types
 */
export const DEFAULT_PRICES = {
  child: 7.5,
  adult: 12,
  student: 9,
};
