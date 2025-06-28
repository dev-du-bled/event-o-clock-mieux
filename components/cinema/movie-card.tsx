"use client";
import { getImageUrl } from "@/lib/tmdb";
import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Movie, movieSchedule } from "@/types/types";
import { getFilmAction } from "@/server/actions/films";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface MovieCardProps {
  movieSchedule: movieSchedule;
}

export default function MovieCard({ movieSchedule }: MovieCardProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const onMount = async () => {
      try {
        setIsLoading(true);
        const result = await getFilmAction(movieSchedule.movieId);
        if (!result.success) {
          const errorMessage =
            result.message ||
            `Impossible de charger le film de "${movieSchedule.showtime}".`;
          toast("Erreur", {
            description: errorMessage,
            closeButton: true,
          });
          return;
        }
        if (!result.results) {
          toast("Erreur", {
            description: "Aucun film trouvé",
            closeButton: true,
          });
          return;
        }
        setMovie(result.results[0]);
      } catch {
        toast("Erreur", {
          description: "Erreur lors du chargement du film",
          closeButton: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    onMount();
    // Ignore this warning, we want the effect to only run once the componant is mounted
  }, []);

  const formatDate = (fullDate: string) => {
    return new Date(fullDate).toLocaleDateString("fr-FR", {
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card className="flex flex-row gap-0 max-w-96 min-h-60 overflow-hidden">
        <Skeleton className="w-24 h-full rounded-none flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1 p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-24 mt-auto" />
        </div>
      </Card>
    );
  }

  return (
    <>
      {movie && (
        <Card className="flex flex-row gap-3 p-4 max-w-96 h-60 hover:shadow-md transition-shadow">
          <div className="relative w-24">
            <Image
              src={getImageUrl(movie.poster_path)}
              alt={`Affiche du film ${movie.title}`}
              fill
              className="object-cover rounded-sm"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="mb-2">
              <h3 className="text-lg font-semibold line-clamp-2 mb-1">
                {movie.title} ({formatDate(movie.release_date)})
              </h3>
              <p className="text-sm font-medium text-primary">
                Séance: {movieSchedule.showtime}
              </p>
            </div>
            <div className="flex flex-col justify-between flex-1 min-h-0">
              <p className="text-xs text-muted-foreground text-justify mb-4 overflow-hidden text-ellipsis line-clamp-6">
                {movie.overview || "Aucune description disponible"}
              </p>
              {/* TODO: Utiliser et refaire le dialog de réservation des sièges */}
              <Button className="self-end" size="sm">
                Réserver
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
