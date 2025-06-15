import { Calendar, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Event } from "@prisma/client";
import Link from "next/link";
import { Price } from "@/schemas/createEvent";

interface EventCardProps {
  event: Event;
}

/**
 * EventCard component displays a card representing an event.
 * It includes event details such as title, location, date, and time.
 * The card image and category are displayed, and the user can click it for further actions.
 *
 * @param event - The event object to display.
 * @param variant - The variant of the card ("default" or "edit").
 */
export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group hover:shadow-lg transition-all duration-300 rounded-2xl"
    >
      <div className="flex flex-col rounded-2xl h-full">
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-2xl">
          {event.images && event.images[0] ? (
            <div className="relative h-48 w-full">
              <Image
                src={event.images[0]}
                alt={event.title}
                fill
                className="rounded-t-2xl object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-48 bg-gray-200 flex items-center justify-center rounded-t-2xl">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {/* Event Categories and Price */}
          <div className="absolute top-4 left-4">
            {event.categories.length > 0 && (
              <span className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full">
                {event.categories[0]}
                {event.categories.length > 1 && (
                  <span className="ml-1 opacity-75">
                    +{event.categories.length - 1}
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <span
              className={`${event.isPaid ? "bg-primary" : "bg-green-500"} text-white text-sm font-semibold px-3 py-1 rounded-full`}
            >
              {event.isPaid && event.prices && event.prices.length > 0
                ? `à partir de ${(event.prices[0] as Price)?.price || 0} €`
                : "Gratuit"}
            </span>
          </div>
        </div>
        {/* Title and Location */}
        <div className="flex justify-between border-2 border-t-0 rounded-b-2xl overflow-hidden">
          <div className="flex flex-col p-4 space-y-2">
            <h3 className="text-2xl font-semibold text-gray-800">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600">{event.city}</p>
          </div>
          {/* Buttons */}
          <div className="translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100 bg-accent-foreground rounded-full p-1 transition-all duration-300 self-center mr-5">
            <ChevronRight className="text-accent" />
          </div>
        </div>
      </div>
    </Link>
  );
}
