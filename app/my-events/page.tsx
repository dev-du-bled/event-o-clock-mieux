/**
 * @file page.tsx
 * @brief User events management page component
 * @details Handles displaying, editing and deleting user's created events
 */
import { getUserEvents } from "@/lib/db/events";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { EventCard } from "@/components/events/event-card";
import NoAuth from "@/components/auth/no-auth";

/**
 * @brief User events management component
 * @details Main component for managing user-created events. Features include:
 *          - Displaying user's created events
 *          - Event deletion functionality
 *          - Event editing navigation
 *          - Loading and error states handling
 *          - Confirmation modals for destructive actions
 *
 * @returns React component for user events management page
 */

export default async function MyEvents() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  if (!user) {
    return <NoAuth />;
  }

  const events = await getUserEvents(user.id);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mes événements</h1>
          <Link
            href="/create-event"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Créer un événement
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-card rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Vous n&apos;avez pas encore créé d&apos;événements
            </h2>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier événement !
            </p>
            <Link
              href="/create-event"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Créer un événement
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
