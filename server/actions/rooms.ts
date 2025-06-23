"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

type ServerActionResult = {
  success: boolean;
  eventId?: string;
  message?: string;
};

/**
 * Vérifie si l'utilisateur a une permission spécifique
 */
async function checkRoomPermission(
  permission: "create" | "update" | "delete" | "assign"
): Promise<boolean> {
  try {
    const result = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        permission: { room: [permission] },
      },
    });
    return result.success || false;
  } catch (error) {
    console.error("Erreur vérification permission:", error);
    return false;
  }
}

/**
 * Action pour supprimer une salle
 */
export async function deleteRoomAction(
  roomId: string
): Promise<ServerActionResult> {
  try {
    // Vérifier que la salle existe
    const foundRoom = await prisma.cinemaRoom.findUnique({
      where: { id: roomId },
    });

    if (!foundRoom) {
      return {
        success: false,
        message: "Salle introuvable",
      };
    }

    // Vérification des permissions
    const canDelete = await checkRoomPermission("delete");
    if (!canDelete) {
      return {
        success: false,
        message: "Vous n'avez pas les permissions pour supprimer cet salle",
      };
    }

    // Supprimer la salle
    await prisma.cinemaRoom.delete({
      where: { id: roomId },
    });

    revalidatePath("/administration ");
    revalidatePath("/cinema");

    return {
      success: true,
      message: "Salle supprimée avec succès",
    };
  } catch (error) {
    console.error("Erreur suppression salle:", error);
    return {
      success: false,
      message: "Erreur lors de la suppression de la salle",
    };
  }
}

/**
 * Action pour créer une salle
 */
export async function createRoomAction(
  name: string,
  capacity: number
): Promise<ServerActionResult> {
  try {
    // Vérification des permissions
    const canCreate = await checkRoomPermission("create");
    if (!canCreate) {
      return {
        success: false,
        message: "Vous n'avez pas la permission de créer une salle",
      };
    }

    const seatsPerRow = 20;

    // Créer la salle
    await prisma.cinemaRoom.create({
      data: {
        name: name,
        capacity: capacity,
        seats: {
          createMany: {
            data: Array.from({ length: capacity }, (_, i) => {
              return {
                row: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(i / seatsPerRow)],
                number: (i % seatsPerRow) + 1,
                isAvailable: true,
              };
            }),
          },
        },
      },
    });

    revalidatePath("/administration ");
    revalidatePath("/cinema");

    return {
      success: true,
      message: "Salle créée avec succès",
    };
  } catch (error) {
    console.error("Erreur création salle:", error);
    return {
      success: false,
      message: "Impossible de créer la salle",
    };
  }
}

/**
 * Action pour créer une salle
 */
export async function editRoomAction(
  roomId: string,
  newRoomName: string
): Promise<ServerActionResult> {
  try {
    // Vérification des permissions
    const canCreate = await checkRoomPermission("create");
    if (!canCreate) {
      return {
        success: false,
        message: "Vous n'avez pas la permission de modifier les salles.",
      };
    }

    // Editer la salle
    await prisma.cinemaRoom.update({
      where: {
        id: roomId,
      },
      data: {
        name: newRoomName,
      },
    });

    revalidatePath("/administration ");
    revalidatePath("/cinema");

    return {
      success: true,
      message: "Salle modifier avec succès",
    };
  } catch (error) {
    console.error("Erreur modification salle:", error);
    return {
      success: false,
      message: "Impossible de modifier la salle",
    };
  }
}

/**
 * Action pour créer une salle
 */
export async function assignMovieRoomAction(
  roomId: string,
  movieId: string,
  showtime: string
): Promise<ServerActionResult> {
  try {
    // Vérification des permissions
    const canCreate = await checkRoomPermission("assign");
    if (!canCreate) {
      return {
        success: false,
        message: "Vous n'avez pas la permission d'assigner des films",
      };
    }

    await prisma.cinemaRoom.update({
      where: {
        id: roomId,
      },
      data: {
        currentMovie: JSON.stringify({ movieId: movieId, showtime: showtime }),
      },
    });

    revalidatePath("/administration ");

    return {
      success: true,
      message: "Film assigné avec succès",
    };
  } catch (error) {
    console.error("Erreur assignation film:", error);
    return {
      success: false,
      message: "Impossible d'assigner le film",
    };
  }
}
