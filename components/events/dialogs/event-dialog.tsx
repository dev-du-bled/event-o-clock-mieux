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
  Loader2,
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
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    isEventFavorite(user.id, event.id).then(is => setIsFavorite(is));
  }, [event.id, user]);

  const handleFavoriteClick = async (eventId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      if (isFavorite) {
        await removeFromFavorites(user.id, eventId);
        setIsFavorite(false);
      } else {
        await addToFavorites(user.id, eventId);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Erreur lors de la gestion des favoris:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer">
        <EventCard event={event} variant={variant} />
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
          <DialogHeader className="px-4 sm:px-6 py-4 border-b shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">
              {event.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col space-y-6">
              {/* Image Section */}
              <div className="w-full">
                <div className="overflow-hidden rounded-lg">
                  {event.images && event.images.length > 0 ? (
                    <Carousel>
                      <CarouselContent>
                        {event.images.map((img, index) => (
                          <CarouselItem key={`${event.id} image-${index}`}>
                            <div className="relative w-full h-64 sm:h-80">
                              <Image
                                src={img}
                                alt={event.title}
                                width={800}
                                height={450}
                                className="object-cover object-center rounded-lg"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </Carousel>
                  ) : (
                    <div className="w-full h-64 sm:h-80 bg-gray-200 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-4 sm:space-y-6">
                {/* Categories and Price */}
                <div className="flex flex-wrap gap-2">
                  {event.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-primary text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                  <span
                    className={`${event.isPaid ? "bg-primary" : "bg-green-500"} text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full`}
                  >
                    {event.isPaid ? `${event.price} €` : "Gratuit"}
                  </span>
                </div>

                {/* Date, Time, Location */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    {event.isRecurring ? (
                      <Repeat className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
                    ) : (
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
                    )}
                    <span className="break-words">
                      {formatEventDate(event)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
                    <span>{formatEventTime(event)}</span>
                  </div>
                  <div className="flex items-start text-gray-600 text-sm sm:text-base">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 shrink-0" />
                    <span className="break-words">{`${event.address} ${event.city} ${event.postalCode}`}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="text-base sm:text-lg font-semibold mb-2">
                    Description
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Contact Info */}
                {(event.organizerPhone || event.organizerWebsite) && (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="text-base sm:text-lg font-semibold">
                      Contact
                    </div>
                    {event.organizerPhone && (
                      <div className="flex items-center text-gray-600 text-sm sm:text-base">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
                        <a
                          href={`tel:${event.organizerPhone}`}
                          className="hover:text-primary break-all"
                        >
                          {event.organizerPhone}
                        </a>
                      </div>
                    )}
                    {event.organizerWebsite && (
                      <div className="flex items-center text-gray-600 text-sm sm:text-base">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
                        <a
                          href={event.organizerWebsite}
                          target="_blank"
                          className="hover:text-primary break-all"
                        >
                          {event.organizerWebsite}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Practical Information */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="text-base sm:text-lg font-semibold">
                    Informations pratiques
                  </div>
                  <div className="flex items-start text-gray-600 text-sm sm:text-base">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-1 shrink-0" />
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
          </div>

          {/* Footer - Fixed at bottom */}
          {user && (
            <DialogFooter className="px-4 sm:px-6 py-4 border-t shrink-0 bg-white">
              <div className="flex justify-center sm:justify-start w-full">
                <button
                  onClick={() => handleFavoriteClick(event.id)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center cursor-pointer text-sm sm:text-base w-full sm:w-auto justify-center ${
                    loading
                      ? "bg-gray-100 text-gray-700"
                      : isFavorite
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : isFavorite ? (
                    <>
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 fill-white" />
                      Retirer des favoris
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Ajouter aux favoris
                    </>
                  )}
                </button>
              </div>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
