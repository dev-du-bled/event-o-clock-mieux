import { getImageUrl, Movie } from "@/lib/tmdb";
import { DEFAULT_PRICES } from "@/types/types";
import { CinemaRoom } from "@prisma/client";
import { Clock, Ticket, Film } from "lucide-react";
import { Card } from "../ui/card";
import SeatsCinemaDialog from "./dialogs/seats-cinema-dialog";
import Image from "next/image";

interface CinemaCardProps {
  movies: Array<Movie>;
  room: CinemaRoom;
}

export default function CinemaCard({ movies, room }: CinemaCardProps) {
  return (
    <Card key={room.id} className="relative p-5">
      <div className="absolute top-4 right-4">
        <SeatsCinemaDialog room={room} />
      </div>

      <h5 className="text-xl font-bold tracking-tight text-gray-900 mb-4">
        {room.name}
      </h5>

      {room.currentMovie ? (
        <div className="space-y-4">
          {movies.find(m => m.id === room.currentMovie?.id) && (
            <>
              <Image
                src={getImageUrl(
                  movies.find(m => m.id === room.currentMovie?.id)
                    ?.poster_path ?? null,
                  "w500"
                )}
                alt={
                  movies.find(m => m.id === room.currentMovie?.id)?.title || ""
                }
                className="rounded-lg shadow-lg w-full h-48 object-cover"
                width={500}
                height={750}
              />
              <div className="space-y-2">
                <p className="font-semibold">
                  {movies.find(m => m.id === room.currentMovie?.id)?.title}
                </p>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{room.currentMovie.showtime}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Ticket className="w-4 h-4 mr-1" />
                  <span>
                    À partir de
                    {Math.min(
                      DEFAULT_PRICES.child,
                      DEFAULT_PRICES.student,
                      DEFAULT_PRICES.adult
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
          <Film className="w-12 h-12 text-gray-400" />
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Capacité: {room.capacity} places
        </p>
      </div>
    </Card>
  );
}
