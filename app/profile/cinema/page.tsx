"use client";

import { useState, useEffect } from "react";
import { getMovieDetails, getImageUrl, type Movie } from "@/lib/tmdb";
import { Calendar, Star, Film, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  getCinemaRooms,
  createCinemaRoom,
  assignMovieToRoom,
} from "@/lib/db/cinema";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";
import { Card } from "@/components/ui/card";
import SeatsCinemaDialog from "@/components/events/dialogs/seats-cinema-dialog";
import { CinemaRoom } from "@prisma/client";
import AssignFilmDialog from "@/components/events/dialogs/assign-film-dialog";
import NoAuth from "@/components/auth/no-auth";

const AVAILABLE_MOVIES = [27205, 155, 680];

const ROOM_CONFIG = {
  rows: 5,
  seatsPerRow: 8,
  vipRows: [0],
};

export default function CinemaManagement() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<CinemaRoom | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [showtime, setShowtime] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const moviePromises = AVAILABLE_MOVIES.map(id => getMovieDetails(id));
        const movieData = await Promise.all(moviePromises);
        if (isMounted) setMovies(movieData);

        let roomsData = await getCinemaRooms();

        if (roomsData.length === 0) {
          const seats = Array.from(
            { length: ROOM_CONFIG.rows },
            (_, rowIndex) =>
              Array.from(
                { length: ROOM_CONFIG.seatsPerRow },
                (_, seatIndex) => ({
                  id: `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`,
                  row: String.fromCharCode(65 + rowIndex),
                  number: seatIndex + 1,
                  isAvailable: true,
                  isVIP: ROOM_CONFIG.vipRows.includes(rowIndex),
                })
              )
          ).flat();

          for (let i = 1; i <= 3; i++) {
            await createCinemaRoom({
              name: `Salle ${i}`,
              capacity: ROOM_CONFIG.rows * ROOM_CONFIG.seatsPerRow,
              seats,
              currentMovie: null,
            });
          }

          roomsData = await getCinemaRooms();
        }

        if (isMounted) setRooms(roomsData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        //   if (isMounted) setError("Erreur lors du chargement des informations");
        // } finally {
        //   if (isMounted) setLoading(false);
        // }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAssignMovie = async () => {
    if (!selectedRoom?.id || !selectedMovie || !showtime) return;

    try {
      await assignMovieToRoom(selectedRoom.id, selectedMovie, showtime);
      const updatedRooms = await getCinemaRooms();
      setRooms(updatedRooms);
      setShowModal(false);
    } catch (err) {
      console.error("Erreur lors de l'assignation du film:", err);
      // setError("Erreur lors de l'assignation du film");
    }
  };

  if (!user) {
    return <NoAuth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">
          Gestion des salles de cinéma
        </h1>

        {/* Movie Room */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {rooms.map(room => (
            <Card key={room.id} className="relative">
              <div className="absolute top-4 right-4 space-x-2">
                <SeatsCinemaDialog room={selectedRoom} />
                <AssignFilmDialog movies={movies} selectedRoom={selectedRoom} />
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
                          movies.find(m => m.id === room.currentMovie?.id)
                            ?.title || ""
                        }
                        className="rounded-lg shadow-lg w-full h-48 object-cover"
                        width={500}
                        height={750}
                      />
                      <div className="space-y-2">
                        <p className="font-semibold">
                          {
                            movies.find(m => m.id === room.currentMovie?.id)
                              ?.title
                          }
                        </p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{room.currentMovie.showtime}</span>
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
          ))}
        </div>

        {/* Modal seatMap */}
        {selectedRoom && <SeatsCinemaDialog room={selectedRoom} />}

        <h2 className="text-2xl font-bold mb-4">Films disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {movies.map(movie => (
            <Card key={movie.id} className="p-5">
              <div className="grid grid-cols-1 gap-4">
                <Image
                  src={getImageUrl(movie.poster_path, "w500")}
                  alt={movie.title}
                  className="rounded-lg shadow-lg w-full h-64 object-cover"
                  width={500}
                  height={750}
                />
                <div className="space-y-4">
                  <h5 className="text-xl font-bold tracking-tight text-gray-900">
                    {movie.title}
                  </h5>

                  <div className="flex flex-wrap items-center gap-4 text-gray-700">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {format(new Date(movie.release_date), "PPP", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      <span className="text-sm">
                        {movie.vote_average.toFixed(1)}/10
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map(genre => (
                      <span
                        key={genre.id}
                        className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
