"use server";

import prisma from "../prisma";
import { TicketType, Prisma } from "@prisma/client";

/**
 * Interface representing a Seat in the cinema.
 * A seat has an ID, row, number, and availability status.
 */
export interface Seat {
  id: string;
  row: string;
  number: number;
  isAvailable: boolean;
}

/**
 * Interface representing a CartItem (a ticket purchased).
 * Contains details like the room, movie, seat, price, and ticket type.
 */
export interface CartItem {
  roomId: string;
  movieId: number;
  seatId: string;
  price: number;
  ticketType: "child" | "adult" | "student";
}

/**
 * Interface representing a Cinema Room.
 * A room has a name, capacity, optional movie currently showing, and a list of seats.
 */
export interface CinemaRoom {
  id?: string;
  name: string;
  capacity: number;
  currentMovie?: {
    id: number;
    showtime: string;
  } | null;
  seats: Seat[];
}

/**
 * Function to create a new cinema room in the database.
 *
 * @param roomData - Data for the new cinema room, excluding the ID.
 * @returns The ID of the newly created cinema room.
 */
export async function createCinemaRoom(
  roomData: Omit<CinemaRoom, "id">,
): Promise<string> {
  try {
    const roomRef = await prisma.cinemaRoom.create({
      data: {
        name: roomData.name,
        capacity: roomData.capacity,
        seats: {
          create: roomData.seats.map((seat) => seat),
        },
        ...(roomData.currentMovie
          ? { currentMovie: roomData.currentMovie }
          : {}),
        createdAt: new Date(),
        updatedAt: new Date(),
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

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      currentMovie: room.currentMovie as {
        id: number;
        showtime: string;
      } | null,
      seats: room.seats.map((seat) => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        isAvailable: seat.isAvailable,
      })),
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des salles:", error);
    throw error;
  }
}

/**
 * Function to update the details of an existing cinema room.
 *
 * @param roomId - The ID of the cinema room to update.
 * @param data - Partial data to update the room.
 */
export async function updateCinemaRoom(
  roomId: string,
  data: Partial<Omit<CinemaRoom, "id">>,
): Promise<void> {
  try {
    const { seats, currentMovie, ...updateRoomData } = data;
    const updateData: Prisma.CinemaRoomUpdateInput = {
      ...updateRoomData,
      updatedAt: new Date(),
      ...(currentMovie !== undefined
        ? {
            currentMovie:
              currentMovie === null ? Prisma.JsonNull : currentMovie,
          }
        : {}),
    };

    // Handle seats separately if they're included in the update

    await prisma.cinemaRoom.update({
      where: { id: roomId },
      data: updateData,
    });

    // If seats were provided, update them separately
    if (seats) {
      // Delete existing seats and create new ones
      await prisma.$transaction(async (tx) => {
        await tx.seat.deleteMany({
          where: { roomId },
        });

        await tx.seat.createMany({
          data: seats.map((seat) => ({
            ...seat,
            roomId,
          })),
        });
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la salle:", error);
    throw error;
  }
}

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
        updatedAt: new Date(),
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
    const rooms = await prisma.cinemaRoom.findMany();

    for (const room of rooms) {
      const seats = Array.from({ length: 5 }, (_, rowIndex) =>
        Array.from({ length: 8 }, (_, seatIndex) => ({
          row: String.fromCharCode(65 + rowIndex),
          number: seatIndex + 1,
          isAvailable: true,
          roomId: room.id,
        })),
      ).flat();

      await prisma.$transaction(async (tx) => {
        // Delete all existing seats for the room
        await tx.seat.deleteMany({
          where: { roomId: room.id },
        });

        // Create new seats
        await tx.seat.createMany({
          data: seats,
        });

        // Update the room's updatedAt timestamp
        await tx.cinemaRoom.update({
          where: { id: room.id },
          data: { updatedAt: new Date() },
        });
      });
    }
  } catch (error) {
    console.error("Erreur lors de la réinitialisation des salles:", error);
    throw error;
  }
}

/**
 * Interface representing a Booking.
 * A booking contains details such as user ID, room ID, movie ID, seats, and total amount.
 */
export interface Booking {
  id?: string;
  userId: string;
  roomId: string;
  movieId: number;
  seats: {
    seatId: string;
    ticketType: "child" | "adult" | "student";
    price: number;
  }[];
  totalAmount: number;
  createdAt?: Date;
  status: "pending" | "confirmed" | "cancelled";
}

/**
 * Enhanced Booking interface to include additional display information
 */
export interface BookingWithDetails extends Booking {
  roomName?: string;
  seats: {
    seatId: string;
    ticketType: "child" | "adult" | "student";
    price: number;
    displayId?: string; // Human-readable ID like "A2"
  }[];
}

/**
 * Function to create a new booking.
 *
 * @param bookingData - Data for the new booking, excluding the ID and creation timestamp.
 * @returns The ID of the newly created booking.
 */
export async function createBooking(
  bookingData: Omit<Booking, "id" | "createdAt">,
): Promise<string> {
  try {
    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Check if seat IDs are in the format of row+number (e.g., "A5")
      const hasRowNumberFormat = bookingData.seats.some((seat) => {
        // Check if seat ID follows pattern like "A5", "B3", etc.
        return /^[A-Z]\d+$/.test(seat.seatId);
      });

      let seatIds = bookingData.seats.map((seat) => seat.seatId);
      let processedSeats = [...bookingData.seats];

      // If using row+number format, convert to actual seat IDs
      if (hasRowNumberFormat) {
        const seatPromises = bookingData.seats.map(async (seat) => {
          if (/^[A-Z]\d+$/.test(seat.seatId)) {
            const row = seat.seatId[0]; // First character (e.g., "A")
            const number = parseInt(seat.seatId.substring(1)); // Rest of string as number (e.g., "5" -> 5)

            // Find the actual seat ID by row and number
            const dbSeat = await tx.seat.findFirst({
              where: {
                roomId: bookingData.roomId,
                row,
                number,
              },
            });

            if (!dbSeat) {
              throw new Error(
                `Seat ${seat.seatId} not found in room ${bookingData.roomId}`,
              );
            }

            // Return the same seat object but with the real UUID
            return {
              ...seat,
              seatId: dbSeat.id,
            };
          }
          return seat;
        });

        processedSeats = await Promise.all(seatPromises);
        seatIds = processedSeats.map((seat) => seat.seatId);
      }

      // First, verify all seats exist and are available
      const existingSeats = await tx.seat.findMany({
        where: {
          id: { in: seatIds },
          roomId: bookingData.roomId,
        },
      });

      // Check if all seats were found
      if (existingSeats.length !== seatIds.length) {
        const foundIds = existingSeats.map((seat) => seat.id);
        const missingIds = seatIds.filter((id) => !foundIds.includes(id));
        throw new Error(`Some seats do not exist: ${missingIds.join(", ")}`);
      }

      // Check if all seats are available
      const unavailableSeats = existingSeats.filter(
        (seat) => !seat.isAvailable,
      );
      if (unavailableSeats.length > 0) {
        const unavailableIds = unavailableSeats.map((seat) => seat.id);
        throw new Error(
          `Some seats are already booked: ${unavailableIds.join(", ")}`,
        );
      }

      // Create the booking
      const booking = await tx.booking.create({
        data: {
          userId: bookingData.userId,
          roomId: bookingData.roomId,
          movieId: bookingData.movieId,
          totalAmount: bookingData.totalAmount,
          status: bookingData.status.toUpperCase() as
            | "PENDING"
            | "CONFIRMED"
            | "CANCELLED",
        },
      });

      // Create booking seats
      for (const seat of processedSeats) {
        await tx.bookingSeat.create({
          data: {
            bookingId: booking.id,
            seatId: seat.seatId,
            ticketType: seat.ticketType.toUpperCase() as TicketType,
            price: seat.price,
          },
        });

        // Update seat availability
        await tx.seat.update({
          where: { id: seat.seatId },
          data: { isAvailable: false },
        });
      }

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
export async function getUserBookings(
  userId: string,
): Promise<BookingWithDetails[]> {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        seats: {
          include: {
            seat: true, // Include the full seat data to get row and number
          },
        },
        room: true, // Include the room to get the name
      },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      userId: booking.userId,
      roomId: booking.roomId,
      roomName: booking.room.name, // Add the room name
      movieId: booking.movieId,
      totalAmount: booking.totalAmount,
      status: booking.status.toLowerCase() as
        | "pending"
        | "confirmed"
        | "cancelled",
      createdAt: booking.createdAt,
      seats: booking.seats.map((bookingSeat) => ({
        seatId: bookingSeat.seatId,
        displayId: `${bookingSeat.seat.row}${bookingSeat.seat.number}`, // Create human-readable ID
        ticketType: bookingSeat.ticketType.toLowerCase() as
          | "child"
          | "adult"
          | "student",
        price: bookingSeat.price,
      })),
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    throw error;
  }
}
