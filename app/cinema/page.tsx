"use client";

import { useState, useEffect } from "react";
import { getMovieDetails, getImageUrl, type Movie } from "@/lib/tmdb";
import { Film, Clock, Check, Ticket } from "lucide-react";
import { Card, Modal, Button } from "flowbite-react";
import { CinemaRoom, getCinemaRooms } from "@/lib/db/cinema";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import Image from "next/image";

/**
 * @brief Cinema room configuration
 * @details Defines the layout parameters for cinema rooms
 */
const ROOM_CONFIG = {
  rows: 5,
  seatsPerRow: 8,
};

/**
 * @brief Default ticket prices by category
 * @details Defines pricing for different ticket types
 */
const DEFAULT_PRICES = {
  child: 7.5,
  adult: 12,
  student: 9,
};

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
  const { user } = useAuth();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<CinemaRoom | null>(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<
    {
      seatId: string;
      ticketType: "child" | "adult" | "student";
      price: number;
    }[]
  >([]);
  const [ticketType, setTicketType] = useState<"child" | "adult" | "student">(
    "adult"
  );

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const roomsData = await getCinemaRooms();
        if (isMounted) {
          setRooms(roomsData);
          const movieIds = roomsData
            .map((room) => room.currentMovie?.id)
            .filter((id): id is number => id !== undefined);

          if (movieIds.length > 0) {
            const moviePromises = movieIds.map((id) => getMovieDetails(id));
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

  const handleSeatClick = (seatId: string) => {
    if (!selectedRoom?.currentMovie) return;

    const existingSeatIndex = selectedSeats.findIndex(
      (item) => item.seatId === seatId
    );

    if (existingSeatIndex !== -1) {
      setSelectedSeats((prev) =>
        prev.filter((_, index) => index !== existingSeatIndex)
      );
    } else {
      const price = DEFAULT_PRICES[ticketType];
      setSelectedSeats((prev) => [
        ...prev,
        {
          seatId,
          ticketType,
          price,
        },
      ]);
    }
  };

  const handleAddToCart = () => {
    /**
     * @brief Add selected seats to cart
     * @details Adds selected seats to the cart using Zustand
     * @note This function adds each selected seat to the cart using the addItem function from the cart store
     * @note The function resets the selection and redirects to the cart
     */
    if (selectedSeats.length === 0 || !selectedRoom?.currentMovie) return;

    selectedSeats.forEach((seat) => {
      addItem({
        roomId: selectedRoom.id!,
        movieId: selectedRoom.currentMovie!.id,
        seatId: seat.seatId,
        price: seat.price,
        ticketType: seat.ticketType,
      });
    });

    setSelectedSeats([]);
    setShowSeatMap(false);

    router.push("/cinema/cart");
  };

  const renderSeatMap = (room: CinemaRoom) => {
    const rows = Array.from({ length: ROOM_CONFIG.rows }, (_, rowIndex) =>
      String.fromCharCode(65 + rowIndex)
    );

    return (
      <div className="space-y-4">
        {/* Screen */}
        <div className="w-full h-8 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600">
          Écran
        </div>

        {/* TicketType */}
        <div className="flex justify-center gap-4 mb-4">
          <select
            value={ticketType}
            onChange={(e) =>
              setTicketType(e.target.value as "child" | "adult" | "student")
            }
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="child">
              Enfant ({DEFAULT_PRICES.child.toFixed(2)} €)
            </option>
            <option value="adult">
              Adulte ({DEFAULT_PRICES.adult.toFixed(2)} €)
            </option>
            <option value="student">
              Étudiant ({DEFAULT_PRICES.student.toFixed(2)} €)
            </option>
          </select>
        </div>

        {/* Seat */}
        <div className="grid gap-4">
          {rows.map((row) => (
            <div key={row} className="flex justify-center gap-2">
              <span className="w-6 text-center text-gray-500">{row}</span>
              {Array.from({ length: ROOM_CONFIG.seatsPerRow }, (_, index) => {
                const seatId = `${row}${index + 1}`;
                const seat = room.seats.find((s) => s.id === seatId);
                const isSelected = selectedSeats.some(
                  (item) => item.seatId === seatId
                );
                const isAvailable = seat?.isAvailable ?? true;

                return (
                  <button
                    key={seatId}
                    onClick={() => isAvailable && handleSeatClick(seatId)}
                    disabled={!isAvailable}
                    className={`w-8 h-8 rounded-t-lg flex items-center justify-center text-sm
                      ${
                        isSelected
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      }
                      ${
                        !isAvailable
                          ? "bg-red-300 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      transition-colors`}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : index + 1}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-300 rounded"></div>
            <span>Occupé</span>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Vous devez être connecté pour réserver des places
            </h2>
            <Link href="/login" className="text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {rooms.map((room) => (
            <Card key={room.id} className="relative">
              <div className="absolute top-4 right-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowSeatMap(true);
                    setSelectedSeats([]);
                  }}
                >
                  Voir les sièges
                </Button>
              </div>

              <h5 className="text-xl font-bold tracking-tight text-gray-900 mb-4">
                {room.name}
              </h5>

              {room.currentMovie ? (
                <div className="space-y-4">
                  {movies.find((m) => m.id === room.currentMovie?.id) && (
                    <>
                      <Image
                        src={getImageUrl(
                          movies.find((m) => m.id === room.currentMovie?.id)
                            ?.poster_path ?? null,
                          "w500"
                        )}
                        alt={
                          movies.find((m) => m.id === room.currentMovie?.id)
                            ?.title || ""
                        }
                        className="rounded-lg shadow-lg w-full h-48 object-cover"
                        width={500}
                        height={750}
                      />
                      <div className="space-y-2">
                        <p className="font-semibold">
                          {
                            movies.find((m) => m.id === room.currentMovie?.id)
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
                            À partir de{" "}
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
        <Modal
          show={showSeatMap}
          onClose={() => {
            setShowSeatMap(false);
            setSelectedSeats([]);
          }}
          size="xl"
        >
          <Modal.Header>Plan des sièges - {selectedRoom?.name}</Modal.Header>
          <Modal.Body>{selectedRoom && renderSeatMap(selectedRoom)}</Modal.Body>
          <Modal.Footer>
            <Button
              onClick={handleAddToCart}
              disabled={selectedSeats.length === 0}
            >
              Ajouter au panier{" "}
              {selectedSeats.length > 0 &&
                `(${selectedSeats
                  .reduce((sum, item) => sum + item.price, 0)
                  .toFixed(2)} €)`}
            </Button>
            <Button
              color="gray"
              onClick={() => {
                setShowSeatMap(false);
                setSelectedSeats([]);
              }}
            >
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
