"use server";

import prisma from "../prisma";
import { Event } from "@prisma/client";

/**
 * Function to add an event to a user's favorites.
 * It adds a new favorite document to the 'favorites' collection in Firestore.
 *
 * @param userId - The ID of the user adding the event to their favorites.
 * @param eventId - The ID of the event being added to favorites.
 * @returns The ID of the newly created favorite.
 */
export async function addToFavorites(
  userId: string,
  eventId: string,
): Promise<string> {
  try {
    console.log(eventId, userId);
    const addFavorite = await prisma.favorite.create({
      data: {
        userId,
        eventId,
        createdAt: new Date(),
      },
    });

    return addFavorite.id;
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    throw error;
  }
}

/**
 * Function to remove an event from a user's favorites.
 * It deletes the favorite document from the 'favorites' collection based on userId and eventId.
 *
 * @param userId - The ID of the user removing the event from their favorites.
 * @param eventId - The ID of the event being removed from favorites.
 */
export async function removeFromFavorites(
  userId: string,
  eventId: string,
): Promise<void> {
  try {
    await prisma.favorite.delete({
      where: { userId_eventId: { userId: userId, eventId: eventId } },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
    throw error;
  }
}

/**
 * Function to get all favorites for a specific user.
 * It queries the 'favorites' collection in Firestore to get all event IDs that the user has favorited.
 *
 * @param userId - The ID of the user whose favorites are to be fetched.
 * @returns An array of events that the user has favorited.
 */
export async function getUserFavorites(userId: string): Promise<Event[]> {
  try {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId,
      },
      include: {
        event: true,
      },
    });
    const events = favorites.map((favorite) => favorite.event);

    return events;
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    throw error;
  }
}

/**
 * Function to check if a specific event is favorited by a user.
 * It checks the 'favorites' collection in Firestore to see if a document exists
 * for the given userId and eventId.
 *
 * @param userId - The ID of the user.
 * @param eventId - The ID of the event.
 * @returns A boolean indicating whether the event is in the user's favorites.
 */
export async function isEventFavorite(
  userId: string,
  eventId: string,
): Promise<boolean> {
  try {
    const isFavorited = await prisma.favorite.findFirst({
      where: { eventId: eventId },
      select: {
        userId: true,
      },
    });

    return isFavorited?.userId === userId;
  } catch (error) {
    console.error("Erreur lors de la vérification des favoris:", error);
    throw error;
  }
}
