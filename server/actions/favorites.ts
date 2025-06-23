"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getUser } from "../util/getUser";

/**
 * Interface representing the structure of a Favorite.
 */
export interface Favorite {
  id?: string;
  userId: string;
  eventId: string;
  createdAt: Date;
}

type ServerActionResult = {
  success: boolean;
  message?: string;
  data?: string | string[] | boolean;
};

/**
 * Server action to add an event to a user's favorites.
 * Includes authentication check and proper error handling.
 *
 * @param eventId - The ID of the event being added to favorites.
 * @returns ServerActionResult with success status and created favorite ID
 */
export async function addToFavoritesAction(
  eventId: string
): Promise<ServerActionResult> {
  try {
    const user = await getUser();

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return {
        success: false,
        message: "Événement introuvable",
      };
    }

    // Vérifier si déjà en favoris
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
    });

    if (existingFavorite) {
      return {
        success: false,
        message: "Événement déjà dans vos favoris",
      };
    }

    const addFavorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        eventId,
        createdAt: new Date(),
      },
    });

    revalidatePath("/favorites");
    revalidatePath("/events");

    return {
      success: true,
      message: "Événement ajouté aux favoris",
      data: addFavorite.id,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    return {
      success: false,
      message: "Erreur lors de l'ajout aux favoris",
    };
  }
}

/**
 * Server action to remove an event from a user's favorites.
 * Includes authentication check and proper error handling.
 *
 * @param eventId - The ID of the event being removed from favorites.
 * @returns ServerActionResult with success status
 */
export async function removeFromFavoritesAction(
  eventId: string
): Promise<ServerActionResult> {
  try {
    const user = await getUser();

    await prisma.favorite.delete({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
    });

    revalidatePath("/favorites");
    revalidatePath("/events");

    return {
      success: true,
      message: "Événement retiré des favoris",
    };
  } catch (error) {
    // Si le favori n'existe pas, considérer comme succès
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return {
        success: true,
        message: "Événement déjà retiré des favoris",
      };
    }

    console.error("Erreur lors de la suppression des favoris:", error);
    return {
      success: false,
      message: "Erreur lors de la suppression des favoris",
    };
  }
}

/**
 * Server action to get all favorites for the authenticated user.
 * Includes authentication check and proper error handling.
 *
 * @returns ServerActionResult with success status and favorite event IDs
 */
export async function getUserFavoritesAction(): Promise<ServerActionResult> {
  try {
    const user = await getUser();

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
      select: {
        eventId: true,
      },
    });

    return {
      success: true,
      data: favorites.map(favorite => favorite.eventId),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des favoris",
      data: [],
    };
  }
}

/**
 * Server action to check if a specific event is favorited by the authenticated user.
 * Includes authentication check and proper error handling.
 *
 * @param eventId - The ID of the event to check.
 * @returns ServerActionResult with success status and boolean indicating if favorited
 */
export async function isEventFavoriteAction(
  eventId: string
): Promise<ServerActionResult> {
  try {
    const user = await getUser();

    if (!user) {
      return {
        success: true,
        data: false,
      };
    }

    const isFavorited = await prisma.favorite.findFirst({
      where: {
        eventId: eventId,
        userId: user.id,
      },
      select: {
        userId: true,
      },
    });

    return {
      success: true,
      data: isFavorited?.userId === user.id,
    };
  } catch (error) {
    console.error("Erreur lors de la vérification des favoris:", error);
    return {
      success: false,
      message: "Erreur lors de la vérification des favoris",
      data: false,
    };
  }
}

/**
 * Simplified function to get user favorites (for server components)
 * Returns empty array if no user or error
 */
export async function getUserFavorites(): Promise<string[]> {
  try {
    const user = await getUser();
    if (!user) return [];

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
      select: {
        eventId: true,
      },
    });

    return favorites.map(favorite => favorite.eventId);
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return [];
  }
}
