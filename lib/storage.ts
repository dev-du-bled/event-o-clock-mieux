"use server";

import sharp from "sharp";
import prisma from "./prisma";

/**
 * Allowed image types for upload (JPEG, JPG, PNG, and WEBP formats).
 */
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * Maximum allowed image size (5MB).
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Custom error class for image validation errors.
 * It provides a custom error name to make error handling more specific.
 */
class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

/**
 * Validates the uploaded image file.
 * Ensures the file type is allowed and the file size does not exceed the limit.
 *
 * @param file - The image file to validate.
 * @returns boolean - Returns true if the image is valid.
 * @throws ImageValidationError - Throws an error if validation fails.
 */
function validateImage(file: File): boolean {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageValidationError(
      "Format de fichier non autorisé. Seuls les formats JPEG, JPG, PNG et WEBP sont acceptés.",
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new ImageValidationError(
      "L'image est trop volumineuse. La taille maximale autorisée est de 5MB.",
    );
  }

  return true;
}

/**
 * Uploads an image to the database for an event.
 *
 * @param file - The image file to upload.
 * @param eventId - The ID of the event to associate the image with.
 * @returns string - The URL of the uploaded image after it's successfully stored.
 * @throws ImageValidationError - Throws an error if image validation fails.
 */

// TODO: Replace with DB
export async function uploadEventImage(
  file: File,
  eventId: string,
): Promise<string> {
  try {
    validateImage(file);
    const img = sharp(await file.arrayBuffer());
    const processed_img_buffer = await img
      .resize({
        width: 800,
        height: 600,
      })
      .toFormat("webp")
      .toBuffer();

    const b64_img = `data:image/webp;base64,${processed_img_buffer.toString("base64")}`;

    await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        images: {
          push: b64_img,
        },
      },
    });

    return b64_img;
  } catch (error) {
    if (error instanceof ImageValidationError) {
      throw error;
    }
    console.error("Erreur lors de l'upload de l'image:", error);
    throw error;
  }
}

/**
 * Uploads a profile image to the database for a user.
 *
 * @param file - The profile image file to upload.
 * @param userId - The ID of the user to associate the image with.
 * @returns string - The URL of the uploaded profile image after it's successfully stored.
 * @throws ImageValidationError - Throws an error if image validation fails.
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
): Promise<string> {
  try {
    validateImage(file);
    const img = sharp(await file.arrayBuffer());
    const processed_img_buffer = await img
      .resize({
        width: 256,
        height: 256,
      })
      .toFormat("webp")
      .toBuffer();

    const b64_img = `data:image/webp;base64,${processed_img_buffer.toString("base64")}`;

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        image: b64_img,
      },
    });

    return b64_img;
  } catch (error) {
    if (error instanceof ImageValidationError) {
      throw error;
    }
    console.error("Erreur lors de l'upload de l'image de profil:", error);
    throw error;
  }
}
