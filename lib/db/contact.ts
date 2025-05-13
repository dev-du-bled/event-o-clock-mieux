"use server";

import prisma from "../prisma";
import { ContactMessage, ContactStatus } from "@prisma/client";

/**
 * Function to submit a contact message. It adds the message to Firestore
 * with a status of 'pending' and records the timestamp when the message is created.
 *
 * @param data - The contact message data (excluding createdAt and status).
 * @returns The ID of the newly created contact message document.
 */
export async function submitContactForm(
  data: Omit<ContactMessage, "createdAt" | "status">,
) {
  try {
    const contactRef = await prisma.contactMessage.create({
      data: {
        ...data,
        createdAt: new Date(),
        status: ContactStatus.pending,
      },
    });

    return contactRef.id;
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    throw error;
  }
}
