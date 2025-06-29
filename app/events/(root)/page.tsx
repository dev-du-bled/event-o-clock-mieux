/**
 * @file page.tsx
 * @brief Events listing page component
 * @details Provides event browsing functionality with search, filtering, and favorite management
 */

import { getAllEvents } from "@/lib/db/events";
import FullInputSearchEvent from "@/components/events/inputs/full-input-search-event";
import FilteredEventsCards from "@/components/events/filtered-events-cards";

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
  const events = await getAllEvents();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          Découvrir les événements
        </h1>

        <div className="bg-card border border-border rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FullInputSearchEvent events={events} />
          </div>
        </div>

        <FilteredEventsCards events={events} />
      </div>
    </div>
  );
}
