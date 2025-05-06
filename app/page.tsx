/**
 * @file page.tsx
 * @brief Homepage component
 * @details Displays featured events and provides search functionality
 */
import { getAllEvents } from "@/lib/db/events";
import { EventDialog } from "@/components/events/dialogs/event-dialog";
import Link from "next/link";
import InputSearchEvent from "@/components/events/inputs/input-search-event";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * @brief Homepage component
 * @details Main landing page component featuring:
 *          - Featured events display
 *          - Event search functionality
 *          - Location-based filtering
 *          - Favorites management
 *          - Event detail modal
 *
 * @returns React component for homepage
 */
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  const events = await getAllEvents();
  const featuredEvents = events.sort(() => 0.5 - Math.random()).slice(0, 4);
  
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Découvrez des événements exceptionnels
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Trouvez et participez à des événements uniques près de chez vous
          </p>
          <InputSearchEvent variant="form" />
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 container px-4 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Événements à la une</h2>
          <Link
            href="/events"
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Voir tous les événements
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredEvents.map(event => (
            <EventDialog
              key={event.id}
              event={event}
              user={user}
              variant="default"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
