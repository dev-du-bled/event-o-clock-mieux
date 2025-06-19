import FavoriteButton from "@/components/events/favorite-button";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEventById } from "@/lib/db/events";
import { weekDaysData } from "@/schemas/createEvent";
import { checkEventPermission } from "@/server/actions/events";
import { isEventFavoriteAction } from "@/server/actions/favorites";
import { getUserWithoutRedirect } from "@/server/util/getUser";
import { Role } from "@prisma/client";
import { Calendar, CalendarDays, MapPin, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const user = await getUserWithoutRedirect();

  const event = await getEventById(id);

  if (!event) redirect("/not-found");

  let isFavorite: boolean = false;
  let canUpdate: boolean = false;
  if (user) {
    isFavorite = (await isEventFavoriteAction(event.id)).data as boolean;
    canUpdate =
      ((await checkEventPermission("update")) && user.id === event.createdBy) ||
      user.role === Role.admin;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto space-y-4 px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row border-b-2 pb-2 justify-between">
          <h1 className="text-2xl font-bold mb-2 sm:mb-0 text-center sm:text-start">
            {event.title}
          </h1>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-2">
            {canUpdate && (
              <Button asChild variant={"outline"} className="w-full sm:w-auto">
                <Link href={`/edit-event/${event.id}`}>
                  <Pencil className="w-4 h-4" />
                  Modifier l&apos;événement
                </Link>
              </Button>
            )}
            {user && (
              <FavoriteButton
                user={user}
                eventId={event.id}
                isFavorite={isFavorite as boolean}
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex justify-center md:justify-start w-full">
            {event.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {event.images.map((img, index) => (
                    <CarouselItem key={`${event.id} image-${index}`}>
                      <div className="relative w-full h-64 sm:h-80">
                        <Image
                          src={img}
                          alt={event.title}
                          fill
                          className="object-cover rounded-lg w-full"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : (
              <div className="rounded-lg bg-muted h-64 sm:h-80 w-full flex items-center justify-center">
                <Calendar className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex flex-col max-h-64 sm:max-h-80 space-y-2 bg-muted/50 p-6 rounded-lg border">
            <h2 className="text-xl font-bold">A propos</h2>
            <ScrollArea className="overflow-y-auto pr-4">
              {event.description}
            </ScrollArea>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Catégories */}
          <div className="flex flex-col space-y-2 rounded-lg p-6 bg-muted/50 border">
            <h2 className="text-xl font-bold">Catégories</h2>
            <div className="flex gap-2 flex-wrap">
              {event.categories.map(cat => (
                <div
                  key={`categorie-${cat}-${event.id}`}
                  className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-sm"
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Date et heure */}
          <div className="flex flex-col space-y-2 rounded-lg p-6 bg-muted/50 border">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Horaires</h2>
              <Link target="_blank" href={`/api/event-calendar?id=${event.id}`}>
                <Button size={"icon"}>
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="text-wrap break-words">
              {event.isRecurring ? (
                <>
                  <strong>Jour(s): </strong>
                  {event.recurringDays.length < 7
                    ? weekDaysData // convert day to french values
                        .filter(day => event.recurringDays.includes(day.id))
                        .map(day => day.label)
                        .join(", ")
                    : "Tous les jours"}
                  <br />
                  <strong>Heure de Début: </strong>
                  {event.startTime}
                  <br />
                  <strong>Heure de Fin: </strong>
                  {event.endTime}
                </>
              ) : (
                <p>
                  <strong>Date: </strong>
                  {new Date(event.startDate).toLocaleDateString("fr-FR")}
                  <br />
                  <strong>Heure de début: </strong> {event.startTime}
                  <br />
                  <strong>Heure de fin: </strong> {event.endTime}
                </p>
              )}
            </div>
          </div>

          {/* Lieu */}
          <div className="flex flex-col space-y-2 rounded-lg p-6 bg-muted/50 border">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Lieu</h2>
              <Link
                target="_blank"
                href={`https://maps.google.com?q=${event.coordinates[1]},${event.coordinates[0]}`}
              >
                <Button size={"icon"}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-wrap break-words">
              <strong>Lieu: </strong> {event.place}
              <br />
              <strong>Adresse: </strong> {event.address}
              <br />
              <strong>Ville: </strong> {`${event.city} ${event.postalCode}`}
            </p>
          </div>
        </div>

        {/* debug */}
        <pre className="text-wrap break-words">
          {JSON.stringify({ ...event, images: [] }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
