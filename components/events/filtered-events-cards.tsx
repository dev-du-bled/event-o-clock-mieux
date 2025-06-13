"use client";

import { Event } from "@prisma/client";
import { EventDialog } from "./dialogs/event-dialog";
import { useStoreParams } from "@/lib/store/url-params";
import { auth } from "@/lib/auth/auth";

interface PropsSearchEventsCards {
  user?: typeof auth.$Infer.Session.user;
  events: Array<Event>;
  favorites?: Array<string>;
}

export default function FilteredEventsCards({
  user,
  events,
}: PropsSearchEventsCards) {
  const { search, location, category, minPrice, maxPrice, startDate, endDate } =
    useStoreParams();

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase());

    const matchesLocation =
      !location ||
      event.address.toLowerCase().includes(location.toLowerCase()) ||
      event.city.toLowerCase().includes(location.toLowerCase());

    const matchesCategory = !category || event.categories.includes(category);

    const matchesPriceRange =
      !minPrice ||
      !maxPrice ||
      (event.price >= minPrice && event.price <= maxPrice) ||
      (event.price === 0 && minPrice === 0);

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

  return filteredEvents.length === 0 ? (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Aucun événement trouvé</h2>
      <p className="text-gray-600">
        Essayez de modifier vos critères de recherche
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredEvents.map(event => (
        <EventDialog
          key={event.id}
          event={event}
          user={user}
          variant="default"
        />
      ))}
    </div>
  );
}
