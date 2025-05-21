/**
 * @file page.tsx
 * @brief Favorites page component
 * @details Manages and displays user's favorite events with real-time updates
 */

import { EventDialog } from "@/components/events/dialogs/event-dialog";
import NoAuth from "@/components/auth/no-auth";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getAllEvents } from "@/lib/db/events";
import { getUserFavorites } from "@/lib/db/favorites";

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  if (!user) {
    return <NoAuth />;
  }

  const events = await getAllEvents();
  const favorites = user && (await getUserFavorites(user.id));
  const favoritesEvents = events.filter(event => {
    if (favorites.includes(event.id)) return event;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mes favoris</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
        {favoritesEvents.length !== 0 ? (
          favoritesEvents.map(event => (
            <EventDialog
              key={event.id}
              event={event}
              favorites={favorites}
              user={user}
              variant="default"
            />
          ))
        ) : (
          <p>Aucun Favoris</p>
        )}
      </div>
    </div>
  );
}
