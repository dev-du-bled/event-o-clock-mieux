import { Calendar, MapPin, Clock, Repeat } from "lucide-react";
import { Event } from "@/lib/db/events";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

/**
 * EventCard component displays a card representing an event.
 * It includes event details such as title, location, date, and time.
 * The card image and category are displayed, and the user can click it for further actions.
 *
 * @param event - The event object to display.
 * @param onClick - The function triggered when the card is clicked.
 */
export function EventCard({ event, onClick }: EventCardProps) {
  const formatEventDate = (event: Event) => {
    if (event.isRecurring) {
      const days = event.recurringDays.map((day) => {
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
    <div
      onClick={onClick}
      className="cursor-pointer max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden group">
        {event.images && event.images[0] ? (
          <Image
            src={event.images[0]}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>
        <div className="space-y-2 text-sm text-gray-500 mb-3">
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
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatEventTime(event)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
