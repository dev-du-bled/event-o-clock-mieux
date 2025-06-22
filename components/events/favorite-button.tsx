"use client";

import { auth } from "@/lib/auth/auth";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Heart, Loader2 } from "lucide-react";
import {
  addToFavoritesAction,
  isEventFavoriteAction,
  removeFromFavoritesAction,
} from "@/server/actions/favorites";

interface FavoriteButtonProps {
  user: typeof auth.$Infer.Session.user;
  eventId: string;
  isFavorite: boolean;
}

export default function FavoriteButton({
  user,
  eventId,
  isFavorite,
}: FavoriteButtonProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [favorite, setFavorite] = useState<boolean>(isFavorite);

  useEffect(() => {
    if (!user) return;

    isEventFavoriteAction(eventId).then(result =>
      setFavorite(result.data as boolean)
    );
  }, [eventId, user]);

  const handleFavoriteClick = async (eventId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      if (favorite) {
        await removeFromFavoritesAction(eventId);

        setFavorite(false);
      } else {
        await addToFavoritesAction(eventId);
        setFavorite(true);
      }
    } catch (err) {
      console.error("Erreur lors de la gestion des favoris:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={favorite ? "destructive" : "default"}
      className="w-full sm:w-auto"
      onClick={() => handleFavoriteClick(eventId)}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement...
        </>
      ) : favorite ? (
        <>
          <Heart className="w-4 h-4 fill-white" />
          Retirer des favoris
        </>
      ) : (
        <>
          <Heart className="w-4 h-4" />
          Ajouter aux favoris
        </>
      )}
    </Button>
  );
}
