"use client";

import { useState, useEffect } from "react";
import { getMovieDetails, getImageUrl, type Movie } from "@/lib/tmdb";
import { Film, Clock, Ticket } from "lucide-react";
import { getCinemaRooms } from "@/lib/db/cinema";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";
import { Card } from "@/components/ui/card";
import SeatsCinemaDialog from "@/components/events/seats-cinema-dialog";
import { CinemaRoom } from "@prisma/client";
import { DEFAULT_PRICES } from "@/types/types";
import NoAuth from "@/components/auth/no-auth";

/**
 * @brief Cinema booking component
 * @details Handles cinema room display, seat selection and ticket booking
 */
export default function Cinema() {
  /**
   * @brief Component state
   * @details Defines component state variables
   * @param movies List of movies
   * @param rooms List of cinema rooms
   * @param loading Loading state
   * @param error Error message
   * @param selectedRoom Selected cinema room
   * @param showSeatMap Seat map display state
   * @param selectedSeats Selected seats
   * @param ticketType Selected ticket type
   * @param user Authenticated user
   * @param router Next.js router
   * @param addItem Cart store addItem function
   * @param setLoading Set loading state
   * @param setError Set error message
   * @param setMovies Set movies list
   * @param setRooms Set cinema rooms list
   * @param setSelectedRoom Set selected cinema room
   * @param setShowSeatMap Set seat map display state
   * @param setSelectedSeats Set selected seats
   * @param setTicketType Set selected ticket type
   *
   * @return Cinema booking component
   * @retval Component view
   *
   * @note This component displays a list of cinema rooms, allows the user to select seats and book tickets
   * @note The component uses the TMDb API to fetch movie details and images
   *
   */
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const roomsData = await getCinemaRooms();
        if (isMounted) {
          setRooms(roomsData);
          const movieIds = roomsData
            .map(room => room.currentMovie?.id)
            .filter((id): id is number => id !== undefined);

          if (movieIds.length > 0) {
            const moviePromises = movieIds.map(id => getMovieDetails(id));
            const movieData = await Promise.all(moviePromises);
            setMovies(movieData);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        // if (isMounted) setError("Erreur lors du chargement des informations");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) {
    return <NoAuth />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Salles de cinéma</h1>

        {/* Movie Room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rooms.map(room => (
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
          ))}
        </div>

        {/* Modal seat map */}
      </div>
    </div>
  );
}
