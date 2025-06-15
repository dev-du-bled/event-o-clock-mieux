"use server";

import { Event } from "@prisma/client";
import prisma from "../prisma";

export type EventDataType = Omit<Event, "id" | "createdAt" | "updatedAt">;

/**
 * Function to fetch all published events.
 * Queries Firestore to get events where the status is 'published'.
 *
 * @returns A list of published events.
 */
export async function getAllEvents() {
  try {
    const events = await prisma.event.findMany();

    return events;
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    throw error;
  }
}

/**
 * Function to fetch events created by a specific user.
 * Queries Firestore to get events where the 'createdBy' field matches the user's ID.
 *
 * @param userId - The ID of the user whose events are to be fetched.
 * @returns A list of events created by the user.
 */
export async function getUserEvents(userId: string) {
  try {
    const userEvents = await prisma.event.findMany({
      where: { user: { id: userId } },
    });

    return userEvents;
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    throw error;
  }
}

export async function getEventById(eventId: string) {
  try {
    const event = await prisma.event.findFirst({
      where: { id: eventId },
    });

    return event;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error);
    throw error;
  }
}
