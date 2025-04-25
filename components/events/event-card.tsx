import { Calendar, MapPin, Clock, Repeat, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import { Event } from "@prisma/client";
import Link from "next/link";
import DeleteEventDialog from "./delete-event-dialog";

interface EventCardProps {
  event: Event;
  variant: "default" | "edit";
}

/**
 * EventCard component displays a card representing an event.
 * It includes event details such as title, location, date, and time.
 * The card image and category are displayed, and the user can click it for further actions.
 *
 * @param event - The event object to display.
 * @param onClick - The function triggered when the card is clicked.
 */
export function EventCard({ event, variant }: EventCardProps) {
  const formatEventDate = (event: Event) => {
    if (event.isRecurring) {
      const days = event.recurringDays.map(day => {
        switch (day) {
          case "monday":
            return "Lundi";
          case "tuesday":
            return "Mardi";
          case "wednesday":
            return "Mercredi";
          case "thursday":
            return "Jeudi";
          case "friday":
            return "Vendredi";
          case "saturday":
            return "Samedi";
          case "sunday":
            return "Dimanche";
          default:
            return "";
        }
      });
      return `Tous les ${days.join(", ")}`;
    }

    try {
      const startDate = format(new Date(event.startDate), "PPP", {
        locale: fr,
      });
      const endDate = format(new Date(event.endDate), "PPP", { locale: fr });

      if (startDate === endDate) {
        return startDate;
      }
      return `Du ${startDate} au ${endDate}`;
    } catch {
      return "Date non définie";
    }
  };

  const formatEventTime = (event: Event) => {
    if (!event.startTime || !event.endTime) {
      return "Horaire non défini";
    }

    try {
      const startTime = format(
        new Date(`2000-01-01T${event.startTime}`),
        "HH:mm"
      );
      const endTime = format(new Date(`2000-01-01T${event.endTime}`), "HH:mm");
      return `${startTime} - ${endTime}`;
    } catch {
      return "Horaire non défini";
    }
  };

  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-50 overflow-hidden group flex">
        {event.images && event.images[0] ? (
          <Image
            src={event.images[0]}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            width={400}
            height={200}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          {event.categories.map((category, index) => (
            <span
              key={index}
              className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full mr-2"
            >
              {category}
            </span>
          ))}
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`${
              event.isPaid ? "bg-primary" : "bg-green-500"
            } text-white text-sm font-semibold px-3 py-1 rounded-full`}
          >
            {event.isPaid ? `${event.price} €` : "Gratuit"}
          </span>
        </div>
      </div>
      <div className="p-5 text-start">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center">
            {event.isRecurring ? (
              <Repeat className="w-4 h-4 mr-1" />
            ) : (
              <Calendar className="w-4 h-4 mr-1" />
            )}
            <span>{formatEventDate(event)}</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatEventTime(event)}</span>
            </div>
            {variant === "edit" && (
              <div className="flex space-x-2 ml-auto">
                <Link
                  href={`/edit-event/${event.id}`}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-5 h-5" />
                </Link>
                <DeleteEventDialog event={event} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
