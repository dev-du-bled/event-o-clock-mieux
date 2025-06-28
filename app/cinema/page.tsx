import { getCinemaRooms } from "@/lib/db/cinema";
import MovieCard from "@/components/cinema/movie-card";

/**
 * @brief Cinema booking component
 * @details Handles cinema room display, seat selection and ticket booking
 */
export default async function Cinema() {
  const rooms = await getCinemaRooms();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          En salle en ce moment
        </h1>

        {/* Movie Room */}
        <div className="flex flex-row flex-wrap gap-6 items-center justify-center">
          {(rooms.length &&
            rooms.map(room => (
              <MovieCard
                key={room.id}
                movieSchedule={JSON.parse(room.currentMovie as string)}
              />
            ))) || <span>Aucun film en ce moment</span>}
        </div>
      </div>
    </div>
  );
}
