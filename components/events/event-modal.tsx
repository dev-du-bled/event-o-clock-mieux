import { Modal } from "flowbite-react";
import { Event } from "@/lib/db/events";
import {
  Calendar,
  MapPin,
  Clock,
  Phone,
  Globe,
  Info,
  Heart,
  Repeat,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

interface EventModalProps {
  event: Event;
  show: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
  favoriteLoading?: boolean;
  showFavoriteButton?: boolean;
}

/**
 * EventModal component displays a modal with detailed event information.
 * Includes event title, description, date, time, location, contact info,
 * and practical information, with an option to add/remove it from favorites.
 *
 * @param event - The event object containing event details.
 * @param show - A boolean to control the visibility of the modal.
 * @param onClose - A function to close the modal.
 * @param isFavorite - A boolean flag to indicate if the event is marked as a favorite.
 * @param onFavoriteClick - A function to handle adding or removing the event from favorites.
 * @param favoriteLoading - A boolean flag to indicate if the favorite action is loading.
 * @param showFavoriteButton - A flag to control whether the favorite button is shown.
 */
export function EventModal({
  event,
  show,
  onClose,
  isFavorite,
  onFavoriteClick,
  favoriteLoading,
  showFavoriteButton = true,
}: EventModalProps) {
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
        "HH:mm",
      );
      const endTime = format(new Date(`2000-01-01T${event.endTime}`), "HH:mm");
      return `${startTime} - ${endTime}`;
    } catch {
      return "Horaire non défini";
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <Modal.Header>
        <div className="text-2xl font-bold">{event.title}</div>
      </Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[300px] rounded-lg overflow-hidden">
            {event.images && event.images.length > 0 ? (
              <Image
                src={event.images[0]}
                alt={event.title}
                className="w-full h-full object-cover"
                width={500}
                height={300}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {event.categories.map((category, index) => (
                <span
                  key={index}
                  className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
              <span
                className={`${event.isPaid ? "bg-primary" : "bg-green-500"} text-white text-sm font-semibold px-3 py-1 rounded-full`}
              >
                {event.isPaid ? `${event.price} €` : "Gratuit"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                {event.isRecurring ? (
                  <Repeat className="w-5 h-5 mr-2" />
                ) : (
                  <Calendar className="w-5 h-5 mr-2" />
                )}
                <span>{formatEventDate(event)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                <span>{formatEventTime(event)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{event.location}</span>
              </div>
            </div>

            <div>
              <div className="text-lg font-semibold mb-2">Description</div>
              <p className="text-gray-600">{event.description}</p>
            </div>

            {(event.organizerPhone || event.organizerWebsite) && (
              <div className="space-y-2">
                <div className="text-lg font-semibold">Contact</div>
                {event.organizerPhone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-2" />
                    <a
                      href={`tel:${event.organizerPhone}`}
                      className="hover:text-primary"
                    >
                      {event.organizerPhone}
                    </a>
                  </div>
                )}
                {event.organizerWebsite && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-5 h-5 mr-2" />
                    <a
                      href={event.organizerWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {event.organizerWebsite}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="text-lg font-semibold">
                Informations pratiques
              </div>
              <div className="flex items-start text-gray-600">
                <Info className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                <ul className="list-disc list-inside space-y-1">
                  {event.isAccessible && (
                    <li>Accessible aux personnes à mobilité réduite</li>
                  )}
                  {event.hasParking && <li>Parking disponible</li>}
                  {event.hasPublicTransport && (
                    <li>Transport en commun à proximité</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-between w-full">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Fermer
          </button>
          {showFavoriteButton && onFavoriteClick && (
            <button
              onClick={onFavoriteClick}
              disabled={favoriteLoading}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                isFavorite
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Heart
                className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`}
              />
              {favoriteLoading
                ? "Chargement..."
                : isFavorite
                  ? "Retirer des favoris"
                  : "Ajouter aux favoris"}
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
