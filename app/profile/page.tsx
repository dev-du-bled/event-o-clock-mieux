/**
 * @file page.tsx
 * @brief User profile management page component
 * @details Handles user profile editing, bookings display and admin cinema management
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ticket } from "lucide-react";
import { getUserBookings } from "@/lib/db/cinema";
import { getMovieDetails } from "@/lib/tmdb";
import Link from "next/link";
import EditProfile from "@/components/user/edit-profile";
import { getUser } from "@/server/util/getUser";

/**
 * @brief User profile management component
 * @details Main component for managing user profile features including:
 *          - Profile information editing
 *          - Profile picture management
 *          - Booking history display
 *          - Admin cinema room management
 *          - Movie assignment to rooms (admin only)
 *
 * @returns React component for user profile page
 */
export default async function Profile() {
  const user = await getUser();

  const userBookings = await getUserBookings(user.id); // TODO: issue here cause db has no relation

  // Fetch movie details for each booking
  const bookings = await Promise.all(
    userBookings.map(async booking => {
      try {
        const movie = await getMovieDetails(booking.movieId.toString());
        return { ...booking, movie };
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du film ${booking.movieId}:`,
          error
        );
        return booking;
      }
    })
  );

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Mon profil</h1>

        <div className="grid grid-cols-1 gap-8">
          {/* User profile */}
          <div className="bg-card border border-border rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-foreground">
              Informations personnelles
            </h2>

            <EditProfile user={user} />
          </div>

          <div className="bg-card border border-border rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Ticket className="w-6 h-6 text-foreground" />
              <h2 className="text-xl font-semibold text-foreground">
                Mes réservations
              </h2>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Vous n&apos;avez pas encore de réservations
                </p>
                <Link
                  href="/cinema"
                  className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Voir les films
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Film</TableCell>
                    <TableCell>Salle</TableCell>
                    <TableCell>Places</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y">
                  {bookings.map(booking => (
                    <TableRow key={booking.id} className="bg-card">
                      <TableCell className="whitespace-nowrap font-medium text-foreground">
                        {/* @ts-expect-error tkt json*/}
                        {booking.movie?.title || `Film #${booking.movieId}`}
                      </TableCell>
                      <TableCell>
                        {booking.roomName ||
                          `Salle ${booking.roomId.substring(0, 4)}`}
                      </TableCell>
                      <TableCell>
                        {booking.seats.map(seat => (
                          <div key={seat.seatId}>
                            {seat.displayId || seat.seatId.substring(0, 8)} (
                            {seat.ticketType} - {seat.price.toFixed(2)} €)
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>{booking.totalAmount.toFixed(2)} €</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "confirmed"
                              ? "bg-success/10 text-success border border-success/20"
                              : booking.status === "pending"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-destructive/10 text-destructive border border-destructive/20"
                          }`}
                        >
                          {booking.status === "confirmed"
                            ? "Confirmée"
                            : booking.status === "pending"
                              ? "En attente"
                              : "Annulée"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
