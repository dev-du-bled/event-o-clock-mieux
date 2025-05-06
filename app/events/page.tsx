"use client";

/**
 * @file page.tsx
 * @brief Events listing page component
 * @details Provides event browsing functionality with search, filtering, and favorite management
 */

import React, { useEffect, useState, Suspense } from "react";
import { getAllEvents } from "@/lib/db/events";
import { Event } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { EventDialog } from "@/components/events/event-dialog";
import SearchEvent from "@/components/events/search-event";

/**
 * SearchParamsHandler component to handle URL search parameters
 */
function SearchParamsHandler({
  setSearchTerm,
  setLocation,
}: {
  setSearchTerm: (value: string) => void;
  setLocation: (value: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    const locationFromUrl = searchParams.get("location");

    if (searchFromUrl) setSearchTerm(searchFromUrl);
    if (locationFromUrl) setLocation(locationFromUrl);
  }, [searchParams, setSearchTerm, setLocation]);

  return null;
}

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
export default function Events() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const allEvents = await getAllEvents();
        setEvents(allEvents);
      } catch (err) {
        setError("Erreur lors du chargement des événements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const categories = Array.from(
    new Set(events.flatMap(event => event.categories))
  ).sort();

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      !location ||
      event.location.toLowerCase().includes(location.toLowerCase());

    const matchesCategory =
      !selectedCategory || event.categories.includes(selectedCategory);

    const matchesPriceRange =
      (event.price >= priceRange[0] && event.price <= priceRange[1]) ||
      (event.price === 0 && priceRange[0] === 0);

    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);

    const matchesDateRange =
      (!startDate || eventStartDate >= new Date(startDate)) &&
      (!endDate || eventEndDate <= new Date(endDate));

    return (
      matchesSearch &&
      matchesLocation &&
      matchesCategory &&
      matchesPriceRange &&
      matchesDateRange
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Suspense>
        <SearchParamsHandler
          setSearchTerm={setSearchTerm}
          setLocation={setLocation}
        />
      </Suspense>

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Découvrir les événements</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchEvent />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="md:col-span-3 flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <label className="block text-sm font-medium">Prix</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    className="w-20 p-2 border rounded-md"
                    value={priceRange[0]}
                    onChange={e =>
                      setPriceRange([+e.target.value, priceRange[1]])
                    }
                    placeholder="Min"
                  />
                  <span>à</span>
                  <input
                    type="number"
                    className="w-20 p-2 border rounded-md"
                    value={priceRange[1]}
                    onChange={e =>
                      setPriceRange([priceRange[0], +e.target.value])
                    }
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium">Période</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    className="w-40 p-2 border rounded-md"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                  <span>à</span>
                  <input
                    type="date"
                    className="w-40 p-2 border rounded-md"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Aucun événement trouvé
            </h2>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.map(event => (
              <EventDialog
                key={event.id}
                user={user}
                event={event}
                variant="default"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
