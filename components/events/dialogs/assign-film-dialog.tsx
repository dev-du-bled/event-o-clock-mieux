"use client";

import { Movie } from "@/lib/tmdb";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { useState } from "react";
import { CinemaRoom } from "@prisma/client";
import { assignMovieToRoom } from "@/lib/db/cinema";

interface AssignFilmDialogProps {
  movies: Movie[];
  selectedRoom: CinemaRoom | null;
}

export default function AssignFilmDialog({
  movies,
  selectedRoom,
}: AssignFilmDialogProps) {
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [showtime, setShowtime] = useState("");

  const handleAssignMovie = async () => {
    if (!selectedRoom?.id || !selectedMovie || !showtime) return;

    try {
      await assignMovieToRoom(selectedRoom.id, selectedMovie, showtime);
    } catch (err) {
      console.error("Erreur lors de l'assignation du film:", err);
      // setError("Erreur lors de l'assignation du film");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Assigner un film</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Film
            </label>
            <select
              value={selectedMovie || ""}
              onChange={e => setSelectedMovie(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              {movies.map(movie => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horaire
            </label>
            <input
              type="time"
              value={showtime}
              onChange={e => setShowtime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAssignMovie}>Assigner</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
