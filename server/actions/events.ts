"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getUser } from "../util/getUser";
import { createEventSchema } from "@/schemas/createEvent";
import prisma from "@/lib/prisma";
import { uploadEventImage } from "@/lib/storage";
import { Base64ToFile } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

type ServerActionResult = {
  success: boolean;
  eventId?: string;
  message?: string;
  errors?: z.inferFlattenedErrors<typeof createEventSchema>["fieldErrors"];
};

/**
 * Vérifie si l'utilisateur a une permission spécifique
 */
export async function checkEventPermission(
  permission: "create" | "update" | "delete"
): Promise<boolean> {
  try {
    const result = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        permission: { event: [permission] },
      },
    });
    return result.success || false;
  } catch {
    return false;
  }
}

/**
 * Action pour créer un événement
 */
export async function createEventAction(
  data: z.infer<typeof createEventSchema>,
  imageStrings: string[]
): Promise<ServerActionResult> {
  try {
    const user = await getUser();

    // Vérification des permissions avec Better Auth
    const canCreate = await checkEventPermission("create");
    if (!canCreate) {
      return {
        success: false,
        message: "Vous n'avez pas les permissions pour créer des événements",
      };
    }

    // Validation des données
    const validationResult = createEventSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Données invalides",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validatedData = validationResult.data;

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: validatedData.startDate!,
        startTime: validatedData.startTime,
        endDate: validatedData.endDate!,
        endTime: validatedData.endTime,
        place: validatedData.place,
        address: validatedData.address,
        city: validatedData.city,
        postalCode: validatedData.postalCode,
        categories: validatedData.categories,
        isPaid: validatedData.isPaid,
        prices: validatedData.prices,
        organizerWebsite: validatedData.organizerWebsite || "",
        organizerPhone: validatedData.organizerPhone || "",
        isRecurring: validatedData.isRecurring,
        recurringDays: validatedData.recurringDays,
        isAccessible: validatedData.isAccessible,
        hasParking: validatedData.hasParking,
        hasPublicTransport: validatedData.hasPublicTransport,
        createdBy: user.id,
        images: [], // On ajoutera les images après
      },
    });

    // Upload des images si présentes
    if (imageStrings.length > 0) {
      const imageUrls: string[] = [];

      for (const imageString of imageStrings) {
        try {
          const file = await Base64ToFile(imageString, `event-${event.id}`);
          const imageUrl = await uploadEventImage(file, event.id);
          imageUrls.push(imageUrl);
        } catch (error) {
          console.error("Erreur upload image:", error);
        }
      }

      // Mettre à jour l'événement avec les URLs des images
      await prisma.event.update({
        where: { id: event.id },
        data: { images: imageUrls },
      });
    }

    revalidatePath("/events");
    revalidatePath("/my-events");

    return {
      success: true,
      eventId: event.id,
      message: "Événement créé avec succès",
    };
  } catch (error) {
    console.error("Erreur création événement:", error);
    return {
      success: false,
      message: "Erreur lors de la création de l'événement",
    };
  }
}

/**
 * Action pour mettre à jour un événement
 */
export async function updateEventAction(
  eventId: string,
  data: z.infer<typeof createEventSchema>,
  imageStrings: string[]
): Promise<ServerActionResult> {
  try {
    const user = await getUser();

    // Vérification que l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return {
        success: false,
        message: "Événement introuvable",
      };
    }

    // Vérification des permissions (créateur ou permission update)
    const canUpdate = await checkEventPermission("update");
    if (!canUpdate && existingEvent.createdBy !== user.id) {
      return {
        success: false,
        message: "Vous n'avez pas les permissions pour modifier cet événement",
      };
    }

    // Validation des données
    const validationResult = createEventSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        success: false,
        message: "Données invalides",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validatedData = validationResult.data;

    // Upload des nouvelles images si présentes
    let imageUrls = existingEvent.images;
    if (imageStrings.length > 0) {
      imageUrls = [];

      for (const imageString of imageStrings) {
        try {
          const file = await Base64ToFile(imageString, `event-${eventId}`);
          const imageUrl = await uploadEventImage(file, eventId);
          imageUrls.push(imageUrl);
        } catch (error) {
          console.error("Erreur upload image:", error);
        }
      }
    }

    // Mettre à jour l'événement
    await prisma.event.update({
      where: { id: eventId },
      data: {
        ...validatedData,
        images: imageUrls,
      },
    });

    revalidatePath("/events");
    revalidatePath("/my-events");
    revalidatePath(`/edit-event/${eventId}`);

    return {
      success: true,
      eventId,
      message: "Événement mis à jour avec succès",
    };
  } catch (error) {
    console.error("Erreur mise à jour événement:", error);
    return {
      success: false,
      message: "Erreur lors de la mise à jour de l'événement",
    };
  }
}

/**
 * Action pour supprimer un événement
 */
export async function deleteEventAction(
  eventId: string
): Promise<ServerActionResult> {
  try {
    const user = await getUser();

    // Vérification que l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return {
        success: false,
        message: "Événement introuvable",
      };
    }

    // Vérification des permissions (créateur ou permission delete)
    const canDelete = await checkEventPermission("delete");
    if (!canDelete && existingEvent.createdBy !== user.id) {
      return {
        success: false,
        message: "Vous n'avez pas les permissions pour supprimer cet événement",
      };
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: { id: eventId },
    });

    revalidatePath("/events");
    revalidatePath("/my-events");

    return {
      success: true,
      message: "Événement supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur suppression événement:", error);
    return {
      success: false,
      message: "Erreur lors de la suppression de l'événement",
    };
  }
}

/**
 * Redirection après succès
 */
export async function redirectAfterSuccess(path: string) {
  redirect(path);
}
