export interface AddressFeature {
  properties: {
    label: string;
    postcode: string;
    city: string;
    housenumber?: string;
    street: string;
  };
}

export interface CityFeature {
  properties: {
    city: string;
    postcode: string;
    context: string;
  };
}

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
