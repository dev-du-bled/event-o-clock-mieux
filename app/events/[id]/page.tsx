import FavoriteButton from "@/components/events/favorite-button";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/lib/db/events";
import { checkEventPermission } from "@/server/actions/events";
import { isEventFavoriteAction } from "@/server/actions/favorites";
import { getUser } from "@/server/util/getUser";
import { Pencil } from "lucide-react";
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
                <Link href={`/edit-events/${event.id}`}>
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
        <div className="flex flex-col md:flex-row gap-4">
          <Image
            src={event.images[0]}
            alt={`image-${event.title}`}
            width={350}
            height={150}
            className="rounded-lg object-cover"
          />
          <div className="space-y-2">
            <h2 className="text-lg font-bold">A propos</h2>
            <p>{`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
