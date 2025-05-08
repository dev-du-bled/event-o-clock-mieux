import { getMovieDetails } from "@/lib/tmdb";
import { getCinemaRooms } from "@/lib/db/cinema";
import NoAuth from "@/components/auth/no-auth";
import CinemaCard from "@/components/events/cinema-card";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * @brief Cinema booking component
 * @details Handles cinema room display, seat selection and ticket booking
 */
export default async function Cinema() {
  /**
   * @brief Component state
   * @details Defines component state variables
   * @param movies List of movies
   * @param rooms List of cinema rooms
   * @param loading Loading state
   * @param error Error message
   * @param selectedRoom Selected cinema room
   * @param showSeatMap Seat map display state
   * @param selectedSeats Selected seats
   * @param ticketType Selected ticket type
   * @param user Authenticated user
   * @param router Next.js router
   * @param addItem Cart store addItem function
   * @param setLoading Set loading state
   * @param setError Set error message
   * @param setMovies Set movies list
   * @param setRooms Set cinema rooms list
   * @param setSelectedRoom Set selected cinema room
   * @param setShowSeatMap Set seat map display state
   * @param setSelectedSeats Set selected seats
   * @param setTicketType Set selected ticket type
   *
   * @return Cinema booking component
   * @retval Component view
   *
   * @note This component displays a list of cinema rooms, allows the user to select seats and book tickets
   * @note The component uses the TMDb API to fetch movie details and images
   *
   */
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  // const [error, setError] = useState("");

  const rooms = await getCinemaRooms();
  const movieIds = rooms
    .map(room => room.currentMovie?.id)
    .filter((id): id is number => id !== undefined);
  const moviePromises = movieIds.map(id => getMovieDetails(id));
  const movieData = await Promise.all(moviePromises);

  if (!user) {
    return <NoAuth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Salles de cinéma</h1>

        {/* Movie Room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rooms.map(room => (
            <CinemaCard key={room.id} room={room} movies={movieData} />
          ))}
        </div>
      </div>
    </div>
  );
}
