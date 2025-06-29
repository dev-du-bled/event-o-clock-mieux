/**
 * @file loading.tsx
 * @brief loading component
 * @details Displays loading while the homepage content is being fetched
 */
import FullInputSearchEvent from "@/components/events/inputs/full-input-search-event";
import { Event } from "@prisma/client";

/**
 * @brief Loading component
 * @details Main Loading page component featuring:
 * @returns React component for Loading
 */
export default async function Loading() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          Découvrir les événements
        </h1>

        <div className="bg-card border border-border rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FullInputSearchEvent events={[{}] as Event[]} />
          </div>
        </div>

        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
