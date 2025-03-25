import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  query,
  where,
  getDoc,
} from "firebase/firestore";

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
  roomData: Omit<CinemaRoom, "id">
): Promise<string> {
  try {
    const roomRef = await addDoc(collection(db, "cinema_rooms"), {
      ...roomData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
    const roomsSnapshot = await getDocs(collection(db, "cinema_rooms"));
    return roomsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CinemaRoom[];
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
  data: Partial<Omit<CinemaRoom, "id">>
): Promise<void> {
  try {
    const roomRef = doc(db, "cinema_rooms", roomId);
    await updateDoc(roomRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
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
  showtime: string
): Promise<void> {
  try {
    const roomRef = doc(db, "cinema_rooms", roomId);
    await updateDoc(roomRef, {
      currentMovie: {
        id: movieId,
        showtime,
      },
      updatedAt: Timestamp.now(),
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
    const roomsSnapshot = await getDocs(collection(db, "cinema_rooms"));
    for (const roomDoc of roomsSnapshot.docs) {
      // const room = roomDoc.data() as CinemaRoom;

      const seats = Array.from({ length: 5 }, (_, rowIndex) =>
        Array.from({ length: 8 }, (_, seatIndex) => ({
          id: `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`,
          row: String.fromCharCode(65 + rowIndex),
          number: seatIndex + 1,
          isAvailable: true,
        }))
      ).flat();

      await updateDoc(doc(db, "cinema_rooms", roomDoc.id), {
        seats,
        updatedAt: Timestamp.now(),
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
  createdAt: Timestamp;
  status: "pending" | "confirmed" | "cancelled";
}

/**
 * Function to create a new booking.
 *
 * @param bookingData - Data for the new booking, excluding the ID and creation timestamp.
 * @returns The ID of the newly created booking.
 */
export async function createBooking(
  bookingData: Omit<Booking, "id" | "createdAt">
): Promise<string> {
  try {
    const bookingRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      createdAt: Timestamp.now(),
    });

    const roomRef = doc(db, "cinema_rooms", bookingData.roomId);
    const room = (await getDoc(roomRef)).data() as CinemaRoom;

    const updatedSeats = room.seats.map((seat) => ({
      ...seat,
      isAvailable: !bookingData.seats.some(
        (bookedSeat) => bookedSeat.seatId === seat.id
      ),
    }));

    await updateDoc(roomRef, { seats: updatedSeats });

    return bookingRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    throw error;
  }
}

/**
 * Function to get all bookings for a user.
 *
 * @param userId - The ID of the user whose bookings to fetch.
 * @returns A list of bookings for the user.
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    throw error;
  }
}
