"use server";

import prisma from "../prisma";
import { EventStatus } from "@prisma/client";

/**
 * Interface representing the structure of an Event.
 * Each event has properties such as title, dates, time, location, description, images, and other details.
 */
export interface Event {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  address: string;
  streetNumber: string;
  street: string;
  city: string;
  postalCode: string;
  description: string;
  images: string[];
  categories: string[];
  isPaid: boolean;
  price: number;
  organizerWebsite?: string;
  organizerPhone?: string;
  createdBy: string;
  status: EventStatus;
  isRecurring: boolean;
  recurringDays: string[];
  recurringEndDate: string | null;
  isAccessible: boolean;
  hasParking: boolean;
  hasPublicTransport: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Function to create a new event.
 * Adds the event details to Firestore and returns the document ID of the newly created event.
 *
 * @param eventData - The details of the event to be created (excluding id, createdAt, and updatedAt)
 * @returns The ID of the newly created event document.
 */
export async function createEvent(
  eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
) {
  try {
    const { address, streetNumber, street, city, postalCode, ...data } =
      eventData;

    const location = `${address} ${streetNumber} ${street} ${city} ${postalCode}`;

    const event = await prisma.event.create({
      data: {
        ...data,
        location: location,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return event.id;
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    throw error;
  }
}

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

/**
 * Function to update an existing event.
 * Updates the specified event document with new data.
 *
 * @param eventId - The ID of the event to be updated.
 * @param eventData - The updated event data (some properties may be omitted).
 */
export async function updateEvent(
  eventId: string,
  eventData: Partial<Omit<Event, "id" | "createdAt" | "createdBy">>,
) {
  try {
    await prisma.event.update({
      data: {
        ...eventData,
        updatedAt: new Date(),
      },
      where: {
        id: eventId,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'événement:", error);
    throw error;
  }
}

/**
 * Function to delete an event and its associated resources.
 * Deletes the event document from Firestore, removes images from the database ,
 * and deletes any associated favorites.
 *
 * @param eventId - The ID of the event to be deleted.
 */
export async function deleteEvent(eventId: string) {
  try {
    await prisma.event.delete({ where: { id: eventId } });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    throw error;
  }
}
