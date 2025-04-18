"use client";

/**
 * @file page.tsx
 * @brief User profile management page component
 * @details Handles user profile editing, bookings display and admin cinema management
 */

import { useState, useRef, useEffect } from "react";
import { User, Camera, Film, Ticket, RefreshCw } from "lucide-react";
import { uploadProfileImage } from "@/lib/storage";
import {
  assignMovieToRoom,
  getCinemaRooms,
  getUserBookings,
  type BookingWithDetails, // Change this import from Booking to BookingWithDetails
  resetCinemaRooms,
} from "@/lib/db/cinema";
import { getMovieDetails, type Movie } from "@/lib/tmdb";
import Link from "next/link";
import { Alert, Table } from "flowbite-react";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";

/**
 * @brief User profile management component
 * @details Main component for managing user profile features including:
 *          - Profile information editing
 *          - Profile picture management
 *          - Booking history display
 *          - Admin cinema room management
 *          - Movie assignment to rooms (admin only)
 *
 * @returns React component for user profile page
 */
export default function Profile() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.image || null
  );
  const [newImage, setNewImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookings, setBookings] = useState<
    (BookingWithDetails & { movie?: Movie })[]
  >([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [resettingRooms, setResettingRooms] = useState(false);

  // film assignment
  const [selectedRoom, setSelectedRoom] = useState("1");
  const [movieId, setMovieId] = useState("");
  const [showtime, setShowtime] = useState("");

  // Show cinema management for admin users
  const showCinemaManagement = user?.role === "admin";

  useEffect(() => {
    async function loadBookings() {
      if (!user) return;

      try {
        const userBookings = await getUserBookings(user.id); // TODO: issue here cause db has no relation

        // Fetch movie details for each booking
        const bookingsWithMovies = await Promise.all(
          userBookings.map(async booking => {
            try {
              const movie = await getMovieDetails(booking.movieId);
              return { ...booking, movie };
            } catch (error) {
              console.error(
                `Erreur lors de la récupération du film ${booking.movieId}:`,
                error
              );
              return booking;
            }
          })
        );

        setBookings(bookingsWithMovies);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des réservations:",
          error
        );
      } finally {
        setLoadingBookings(false);
      }
    }

    loadBookings();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Vous devez être connecté pour accéder à votre profil
            </h2>
            <Link href="/login" className="text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let photoURL = user.image || "";

      if (newImage) {
        photoURL = await uploadProfileImage(newImage, user.id);
      }

      await authClient.updateUser({
        image: photoURL,
        name: displayName,
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError("Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleMovieAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!movieId || !showtime) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }

      const rooms = await getCinemaRooms();
      const room = rooms.find(r => r.name === `Salle ${selectedRoom}`);

      if (!room) {
        setError("Salle non trouvée");
        return;
      }

      await assignMovieToRoom(room.id!, parseInt(movieId), showtime);
      setSuccess("Film assigné avec succès !");

      setMovieId("");
      setShowtime("");
    } catch (err) {
      console.error("Erreur lors de l'assignation du film:", err);
      setError("Une erreur est survenue lors de l'assignation du film");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRooms = async () => {
    setResettingRooms(true);
    setError("");
    setSuccess("");

    try {
      await resetCinemaRooms();
      setSuccess("Les salles ont été réinitialisées avec succès !");
    } catch (err) {
      console.error("Erreur lors de la réinitialisation des salles:", err);
      setError(
        "Une erreur est survenue lors de la réinitialisation des salles"
      );
    } finally {
      setResettingRooms(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

        <div className="grid grid-cols-1 gap-8">
          {/* User profile */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">
              Informations personnelles
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* profile picture */}
              <div className="text-center">
                <div
                  onClick={handleImageClick}
                  className="relative inline-block cursor-pointer group rounded-full"
                >
                  {imagePreview ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto">
                      <Image
                        src={imagePreview}
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                        height={128}
                        width={128}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Cliquez pour modifier votre photo de profil
                </p>
              </div>

              {/* display name */}
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom d&apos;affichage
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Votre nom d'affichage"
                />
              </div>

              {/* Email  */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-50 text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mise à jour..." : "Enregistrer les modifications"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Ticket className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Mes réservations</h2>
            </div>

            {loadingBookings ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Vous n&apos;avez pas encore de réservations
                </p>
                <Link
                  href="/cinema"
                  className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Voir les films
                </Link>
              </div>
            ) : (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Film</Table.HeadCell>
                  <Table.HeadCell>Salle</Table.HeadCell>
                  <Table.HeadCell>Places</Table.HeadCell>
                  <Table.HeadCell>Total</Table.HeadCell>
                  <Table.HeadCell>Statut</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {bookings.map(booking => (
                    <Table.Row key={booking.id} className="bg-white">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                        {booking.movie?.title || `Film #${booking.movieId}`}
                      </Table.Cell>
                      <Table.Cell>
                        {booking.roomName ||
                          `Salle ${booking.roomId.substring(0, 4)}`}
                      </Table.Cell>
                      <Table.Cell>
                        {booking.seats.map(seat => (
                          <div key={seat.seatId}>
                            {seat.displayId || seat.seatId.substring(0, 8)} (
                            {seat.ticketType} - {seat.price.toFixed(2)} €)
                          </div>
                        ))}
                      </Table.Cell>
                      <Table.Cell>
                        {booking.totalAmount.toFixed(2)} €
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status === "confirmed"
                            ? "Confirmée"
                            : booking.status === "pending"
                              ? "En attente"
                              : "Annulée"}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </div>

          {/* Admin management */}
          {showCinemaManagement && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Film className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Gestion des films</h2>
                </div>
                <button
                  onClick={handleResetRooms}
                  disabled={resettingRooms}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      resettingRooms ? "animate-spin" : ""
                    }`}
                  />
                  {resettingRooms
                    ? "Réinitialisation..."
                    : "Réinitialiser les salles"}
                </button>
              </div>

              {success && (
                <Alert color="success" className="mb-4">
                  {success}
                </Alert>
              )}

              <form onSubmit={handleMovieAssignment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salle
                  </label>
                  <select
                    value={selectedRoom}
                    onChange={e => setSelectedRoom(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="1">Salle 1</option>
                    <option value="2">Salle 2</option>
                    <option value="3">Salle 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID du film
                  </label>
                  <input
                    type="text"
                    value={movieId}
                    onChange={e => setMovieId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: 27205 pour Inception"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    IDs disponibles : 27205 (Inception), 155 (The Dark Knight),
                    680 (Pulp Fiction)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horaire
                  </label>
                  <input
                    type="time"
                    value={showtime}
                    onChange={e => setShowtime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Assignation..." : "Assigner le film"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
