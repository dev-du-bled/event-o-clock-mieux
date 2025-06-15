/**
 * @file page.tsx
 * @brief Events listing page component
 * @details Provides event browsing functionality with search, filtering, and favorite management
 */

import { getAllEvents } from "@/lib/db/events";
import FullInputSearchEvent from "@/components/events/inputs/full-input-search-event";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import FilteredEventsCards from "@/components/events/filtered-events-cards";
import { getUserFavorites } from "@/server/actions/favorites";

/**
 * @brief Events listing component
 * @details Main component for displaying and filtering events. Features include:
 *          - Event search and filtering
 *          - Category selection
 *          - Price range filtering
 *          - Date range filtering
 *          - Location-based filtering
 *          - Favorites management
 *          - Event detail modal
 *
 * @returns React component for events page
 */
export default async function Events() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  const events = await getAllEvents();
  const favorites = await getUserFavorites();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Découvrir les événements</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FullInputSearchEvent events={events} />
          </div>
        </div>

        <FilteredEventsCards
          user={user}
          events={events}
          favorites={favorites}
        />
      </div>
    </div>
  );
}
