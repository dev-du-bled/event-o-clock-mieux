import FavoriteButton from "@/components/events/favorite-button";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { getEventById } from "@/lib/db/events";
import { checkEventPermission } from "@/server/actions/events";
import { isEventFavoriteAction } from "@/server/actions/favorites";
import { getUser } from "@/server/util/getUser";
import { Calendar, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const user = await getUser();

  const event = await getEventById(id);

  if (!event) redirect("/not-found");

  const isFavorite = (await isEventFavoriteAction(user.id)).data;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto space-y-4 px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row border-b-2 pb-2 justify-between">
          <h1 className="text-2xl font-bold mb-2 sm:mb-0 text-center sm:text-start">
            {event.title}
          </h1>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-2">
            {(await checkEventPermission("update")) && (
              <Button asChild variant={"outline"} className="w-full sm:w-auto">
                <Link href={`/edit-event/${event.id}`}>
                  <Pencil className="w-4 h-4" />
                  Modifier l&apos;événement
                </Link>
              </Button>
            )}
            <FavoriteButton
              user={user}
              eventId={event.id}
              isFavorite={isFavorite as boolean}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex justify-center md:justify-start w-full md:w-1/2">
            <div className="w-full">
              {event.images.length > 0 ? (
                <Carousel>
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
                <div className="rounded-lg w-full h-64 sm:h-80 bg-muted flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 w-full md:w-1/2">
            <h2 className="text-lg font-bold">A propos</h2>
            <p className="text-wrap break-words">{event.description}</p>
          </div>
        </div>
        {/* debug */}
        <pre>{JSON.stringify(event, null, 2)}</pre>
      </div>
    </div>
  );
}
