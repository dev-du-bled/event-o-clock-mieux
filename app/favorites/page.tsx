"use client";

/**
 * @file page.tsx
 * @brief Favorites page component
 * @details Manages and displays user's favorite events with real-time updates
 */

import React, { useEffect, useState } from "react";
import { getUserFavorites } from "@/lib/db/favorites";
import { getAllEvents } from "@/lib/db/events";
import { Event } from "@prisma/client";
import Link from "next/link";
import { EventDialog } from "@/components/events/event-dialog";
import { isEventFavorite } from "@/lib/db/favorites";
import { authClient } from "@/lib/auth/auth-client";

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
export default function Favorites() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return;

      try {
        const favoriteIds = await getUserFavorites(user.id);
        const allEvents = await getAllEvents();
        const favoriteEvents = allEvents.filter(event =>
          favoriteIds.includes(event.id!)
        );
        setEvents(favoriteEvents);
      } catch (err) {
        setError("Erreur lors du chargement des favoris");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [user]);

  useEffect(() => {
    async function checkFavorite() {
      if (user && selectedEvent?.id) {
        try {
          const favorite = await isEventFavorite(user.id, selectedEvent.id);
          setIsFavorite(favorite);
        } catch (err) {
          console.error("Erreur lors de la vérification des favoris:", err);
        }
      }
    }

    if (user && selectedEvent?.id) {
      checkFavorite();
    }
  }, [user, selectedEvent]);

  // Show login prompt if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Vous devez être connecté pour voir vos favoris
            </h2>
            <Link href="/login" className="text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mes favoris</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Vous n&apos;avez pas encore de favoris
            </h2>
            <p className="text-gray-600 mb-4">
              Explorez les événements et ajoutez-les à vos favoris !
            </p>
            <Link
              href="/events"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Découvrir les événements
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map(event => (
              <EventDialog key={event.id} event={event} variant="default" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
