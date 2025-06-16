/**
 * @file page.tsx
 * @brief Favorites page component
 * @details Manages and displays user's favorite events with real-time updates
 */

import { getAllEvents } from "@/lib/db/events";
import { getUserFavorites } from "@/server/actions/favorites";
import { EventCard } from "@/components/events/event-card";
import { getUser } from "@/server/util/getUser";

/**
 * @brief Favorites management component
 * @details Main component for handling user's favorite events. Features include:
 *          - Loading and displaying favorite events
 *          - Real-time favorite status updates
 *          - Event detail modal integration
 *          - Favorite addition/removal functionality
 *
 * @returns React component for favorites page
 */
export default async function Favorites() {
  await getUser();

  const events = await getAllEvents();
  const favorites = await getUserFavorites();
  const favoritesEvents = events.filter(event => {
    if (favorites.includes(event.id)) return event;
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mes favoris</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoritesEvents.length !== 0 ? (
            favoritesEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <p>Aucun Favoris</p>
          )}
        </div>
      </div>
    </div>
  );
}
