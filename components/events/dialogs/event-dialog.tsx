"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import Image from "next/image";
import { EventCard } from "../event-card";
import { auth } from "@/lib/auth/auth";
import {
  addToFavorites,
  isEventFavorite,
  removeFromFavorites,
} from "@/lib/db/favorites";
import { useEffect, useState } from "react";
import { Event } from "@prisma/client";
import { formatEventDate, formatEventTime } from "@/lib/utils";

interface EventDialogProps {
  user?: typeof auth.$Infer.Session.user;
  event: Event;
  variant: "default" | "edit";
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
export function EventDialog({ event, user, variant }: EventDialogProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // fetch if event is favorite from db
    // TODO: not on each card but in parent compo
    const getFavorite = async () => {
      if (user && event.id) {
        try {
          const favorite = await isEventFavorite(user.id, event.id);
          setIsFavorite(favorite);
        } catch (err) {
          console.error("Erreur lors de la vérification des favoris:", err);
        }
      }
    };

    getFavorite();
  }, [user, event.id]);

  const handleFavoriteClick = async (eventId: string) => {
    if (!user) return;

    try {
      if (isFavorite) {
        await removeFromFavorites(user.id, eventId);
      } else {
        await addToFavorites(user.id, eventId);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Erreur lors de la gestion des favoris:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer">
        <EventCard event={event} variant={variant} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {event.title}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[300px] rounded-lg overflow-hidden">
            {event.images && event.images.length > 0 ? (
              <Carousel>
                <CarouselContent>
                  {event.images.map((img, index) => (
                    <CarouselItem key={`${event.id} image-${index}`}>
                      <Image
                        src={img}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        width={500}
                        height={300}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
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
        {user && (
          <DialogFooter>
            <div className="flex justify-between w-full">
              <button
                onClick={() => handleFavoriteClick(event.id)}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                  isFavorite
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Heart
                  className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              </button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
