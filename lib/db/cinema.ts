"use server";

import prisma from "../prisma";
import { Prisma, CinemaRoom, Booking, BookingStatus } from "@prisma/client";

/**
 * Function to create a new cinema room in the database.
 *
 * @param roomData - Data for the new cinema room, excluding the ID.
 * @returns The ID of the newly created cinema room.
 */
export async function createCinemaRoom(
  roomData: Omit<CinemaRoom, "id" | "createdAt" | "updatedAt" | "seats">,
): Promise<string> {
  try {
    const seatsPerRow = 10;
    const seatsToGenerate = roomData.capacity;

    const seats = Array.from({ length: seatsToGenerate }, (_, index) => ({
      seatLabel:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(index / seatsPerRow) % 26] +
        index.toString(),
    }));

    const roomRef = await prisma.cinemaRoom.create({
      data: {
        ...roomData,
        currentMovie:
          roomData.currentMovie === null
            ? Prisma.JsonNull
            : roomData.currentMovie,
        seats: { createMany: { data: seats } },
      },
    });
    return roomRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la salle:", error);
    throw error;
  }
}

/**
 * Function to fetch all cinema rooms from the database.
 *
 * @returns A list of cinema rooms.
 */
export async function getCinemaRooms(): Promise<CinemaRoom[]> {
  try {
    const rooms = await prisma.cinemaRoom.findMany({
      include: {
        seats: true,
      },
    });

    return rooms;
  } catch (error) {
    console.error("Erreur lors de la récupération des salles:", error);
    throw error;
  }
}

// Seems to be unused so i commented it out to bother with it later :3
/**
 * Function to update the details of an existing cinema room.
 *
 * @param roomId - The ID of the cinema room to update.
 * @param data - Partial data to update the room.
 */
// export async function updateCinemaRoom(
//   roomId: string,
//   data: Partial<Omit<CinemaRoom, "id">>,
// ): Promise<void> {
//   try {
//     const { seats, currentMovie, ...updateRoomData } = data;
//     const updateData: Prisma.CinemaRoomUpdateInput = {
//       ...updateRoomData,
//       updatedAt: new Date(),
//       ...(currentMovie !== undefined
//         ? {
//             currentMovie:
//               currentMovie === null ? Prisma.JsonNull : currentMovie,
//           }
//         : {}),
//     };

//     // Handle seats separately if they're included in the update

//     await prisma.cinemaRoom.update({
//       where: { id: roomId },
//       data: updateData,
//     });

//     // If seats were provided, update them separately
//     if (seats) {
//       // Delete existing seats and create new ones
//       await prisma.$transaction(async (tx) => {
//         await tx.seat.deleteMany({
//           where: { roomId },
//         });

//         await tx.seat.createMany({
//           data: seats.map((seat) => ({
//             ...seat,
//             roomId,
//           })),
//         });
//       });
//     }
//   } catch (error) {
//     console.error("Erreur lors de la mise à jour de la salle:", error);
//     throw error;
//   }
// }

/**
 * Function to assign a movie to a cinema room.
 *
 * @param roomId - The ID of the room to assign the movie to.
 * @param movieId - The ID of the movie.
 * @param showtime - The showtime for the movie.
 */
export async function assignMovieToRoom(
  roomId: string,
  movieId: number,
  showtime: string,
): Promise<void> {
  try {
    await prisma.cinemaRoom.update({
      where: { id: roomId },
      data: {
        currentMovie: {
          id: movieId,
          showtime,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'assignation du film:", error);
    throw error;
  }
}

/**
 * Function to reset all cinema rooms to their initial state, i.e., reset all seats as available.
 */
export async function resetCinemaRooms(): Promise<void> {
  try {
    await prisma.booking.updateMany({
      data: {
        status: BookingStatus.past,
      },
    });

    await prisma.seat.updateMany({
      data: {
        bookingId: null,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation des salles:", error);
    throw error;
  }
}

/**
 * Function to create a new booking.
 *
 * @param bookingData - Data for the new booking, userId represents the id of the user the seats are booked for, movieId is the TMDB, totalAmount represents the total amount of money the user paid. Seats contains the ids of the seats to book
 * @returns The ID of the newly created booking.
 */
export async function bookSeats(bookingData: {
  userId: string;
  movieId: number;
  totalAmount: number;
  seats: string[];
}): Promise<string> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const seatIds = bookingData.seats;

      const existingSeats = await tx.seat.findMany({
        where: {
          id: { in: seatIds },
        },
      });

      if (existingSeats.length !== seatIds.length) {
        const foundIds = existingSeats.map((seat) => seat.id);
        const missingIds = seatIds.filter((id) => !foundIds.includes(id));
        throw new Error(
          `Certains sièges n'existent pas dans cette salle: ${missingIds.join(", ")}`,
        );
      }

      const unavailableSeats = existingSeats.filter(
        (seat) => seat.bookingId !== null,
      );
      if (unavailableSeats.length > 0) {
        const unavailableIds = unavailableSeats.map((seat) => seat.id);
        throw new Error(
          `Certains sièges sont déjà pris: ${unavailableIds.join(", ")}`,
        );
      }

      const booking = await tx.booking.create({
        data: {
          userId: bookingData.userId,
          movieId: bookingData.movieId,
          totalAmount: bookingData.totalAmount,
          status: BookingStatus.confirmed,
        },
      });

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { bookingId: booking.id },
      });

      return booking.id;
    });

    return result;
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    throw error;
  }
}

/**
 * Function to get all bookings for a user.
 *
 * @param userId - The ID of the user whose bookings to fetch.
 * @returns A list of bookings for the user with human-readable details.
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: userId },
      include: {
        seats: true,
      },
    });
    return bookings;
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    throw error;
  }
}
