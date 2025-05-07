"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getCinemaRooms,
  assignMovieToRoom,
  resetCinemaRooms,
} from "@/lib/db/cinema";
import { Film, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function FormMoviesManagement() {
  const [selectedRoom, setSelectedRoom] = useState("1");
  const [movieId, setMovieId] = useState("");
  const [showtime, setShowtime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resettingRooms, setResettingRooms] = useState(false);

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
    <>
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
            className={`w-4 h-4 mr-2 ${resettingRooms ? "animate-spin" : ""}`}
          />
          {resettingRooms ? "Réinitialisation..." : "Réinitialiser les salles"}
        </button>
      </div>

      {success && (
        <Alert variant="success" className="mb-4">
          <AlertTitle>Succès</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleMovieAssignment} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4 p-4">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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
            IDs disponibles : 27205 (Inception), 155 (The Dark Knight), 680
            (Pulp Fiction)
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
    </>
  );
}
