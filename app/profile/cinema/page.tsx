"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getMovieDetails, getImageUrl, type Movie } from "@/lib/tmdb";
import { Calendar, Star, Film, Clock, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, Modal, Button, Alert } from "flowbite-react";
import { CinemaRoom, getCinemaRooms, createCinemaRoom, assignMovieToRoom, updateCinemaRoom } from "@/lib/db/cinema";
import Link from "next/link";

const AVAILABLE_MOVIES = [27205, 155, 680];

const ROOM_CONFIG = {
  rows: 5,
  seatsPerRow: 8,
  vipRows: [0],
};

export default function CinemaManagement() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<CinemaRoom | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [showtime, setShowtime] = useState("");
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const moviePromises = AVAILABLE_MOVIES.map((id) => getMovieDetails(id));
        const movieData = await Promise.all(moviePromises);
        if (isMounted) setMovies(movieData);

        let roomsData = await getCinemaRooms();

        if (roomsData.length === 0) {
          const seats = Array.from({ length: ROOM_CONFIG.rows }, (_, rowIndex) =>
            Array.from({ length: ROOM_CONFIG.seatsPerRow }, (_, seatIndex) => ({
              id: `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`,
              row: String.fromCharCode(65 + rowIndex),
              number: seatIndex + 1,
              isAvailable: true,
              isVIP: ROOM_CONFIG.vipRows.includes(rowIndex),
            })),
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
        if (isMounted) setError("Erreur lors du chargement des informations");
      } finally {
        if (isMounted) setLoading(false);
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
      setError("Erreur lors de l'assignation du film");
    }
  };

  const handleSeatClick = (seatId: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const renderSeatMap = (room: CinemaRoom) => {
    const rows = Array.from({ length: ROOM_CONFIG.rows }, (_, rowIndex) => String.fromCharCode(65 + rowIndex));

    return (
      <div className="space-y-4">
        <div className="w-full h-8 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600">Écran</div>

        {/* Seat */}
        <div className="grid gap-4">
          {rows.map((row) => (
            <div key={row} className="flex justify-center gap-2">
              <span className="w-6 text-center text-gray-500">{row}</span>
              {Array.from({ length: ROOM_CONFIG.seatsPerRow }, (_, index) => {
                const seatId = `${row}${index + 1}`;
                const seat = room.seats.find((s) => s.id === seatId);
                const isVIP = ROOM_CONFIG.vipRows.includes(rows.indexOf(row));
                const isSelected = selectedSeats.includes(seatId);
                const isAvailable = seat?.isAvailable ?? true;

                return (
                  <button
                    key={seatId}
                    onClick={() => isAvailable && handleSeatClick(seatId)}
                    disabled={!isAvailable}
                    className={`w-8 h-8 rounded-t-lg flex items-center justify-center text-sm
                      ${isVIP ? "bg-purple-100 hover:bg-purple-200" : "bg-gray-100 hover:bg-gray-200"}
                      ${isSelected ? "bg-green-500 text-white hover:bg-green-600" : ""}
                      ${!isAvailable ? "bg-gray-300 cursor-not-allowed" : "cursor-pointer"}
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
            <span>Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 rounded"></div>
            <span>VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
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
            <h2 className="text-xl font-semibold mb-4">Vous devez être connecté pour gérer les salles</h2>
            <Link href="/login" className="text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Gestion des salles de cinéma</h1>

        {/* Movie Room */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {rooms.map((room) => (
            <Card key={room.id} className="relative">
              <div className="absolute top-4 right-4 space-x-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowSeatMap(true);
                  }}
                >
                  Voir les sièges
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowModal(true);
                  }}
                >
                  Assigner un film
                </Button>
              </div>

              <h5 className="text-xl font-bold tracking-tight text-gray-900 mb-4">{room.name}</h5>

              {room.currentMovie ? (
                <div className="space-y-4">
                  {movies.find((m) => m.id === room.currentMovie?.id) && (
                    <>
                      <img
                        src={getImageUrl(movies.find((m) => m.id === room.currentMovie?.id)?.poster_path ?? null, "w500")}
                        alt={movies.find((m) => m.id === room.currentMovie?.id)?.title}
                        className="rounded-lg shadow-lg w-full h-48 object-cover"
                      />
                      <div className="space-y-2">
                        <p className="font-semibold">{movies.find((m) => m.id === room.currentMovie?.id)?.title}</p>
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
                <p className="text-sm text-gray-600">Capacité: {room.capacity} places</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal film */}
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header>Assigner un film à {selectedRoom?.name}</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Film</label>
                <select
                  value={selectedMovie || ""}
                  onChange={(e) => setSelectedMovie(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="">Sélectionner un film</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horaire</label>
                <input
                  type="time"
                  value={showtime}
                  onChange={(e) => setShowtime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleAssignMovie}>Assigner</Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal seatMap */}
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
              onClick={() => {
                setShowSeatMap(false);
                setSelectedSeats([]);
              }}
            >
              Réserver les sièges ({selectedSeats.length})
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

        <h2 className="text-2xl font-bold mb-4">Films disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <Card key={movie.id}>
              <div className="grid grid-cols-1 gap-4">
                <img
                  src={getImageUrl(movie.poster_path, "w500")}
                  alt={movie.title}
                  className="rounded-lg shadow-lg w-full h-64 object-cover"
                />
                <div className="space-y-4">
                  <h5 className="text-xl font-bold tracking-tight text-gray-900">{movie.title}</h5>

                  <div className="flex flex-wrap items-center gap-4 text-gray-700">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">{format(new Date(movie.release_date), "PPP", { locale: fr })}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      <span className="text-sm">{movie.vote_average.toFixed(1)}/10</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span key={genre.id} className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
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
