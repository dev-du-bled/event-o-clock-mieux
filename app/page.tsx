"use client";

/**
 * @file page.tsx
 * @brief Homepage component
 * @details Displays featured events and provides search functionality
 */
import { useState, useEffect } from "react";
import { getAllEvents, type Event } from "@/lib/db/events";
import { useAuth } from "@/context/auth-context";
import {
  addToFavorites,
  removeFromFavorites,
  isEventFavorite,
} from "@/lib/db/favorites";
import { EventCard } from "@/components/events/event-card";
import { EventModal } from "@/components/events/event-modal";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import Link from "next/link";

interface CityFeature {
  properties: {
    city: string;
    postcode: string;
    context: string;
  };
}
/**
 * @brief Homepage component
 * @details Main landing page component featuring:
 *          - Featured events display
 *          - Event search functionality
 *          - Location-based filtering
 *          - Favorites management
 *          - Event detail modal
 *
 * @returns React component for homepage
 */
export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CityFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const allEvents = await getAllEvents();
        const shuffled = allEvents.sort(() => 0.5 - Math.random());
        setFeaturedEvents(shuffled.slice(0, 4));
      } catch (err) {
        console.error("Erreur lors du chargement des événements:", err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  useEffect(() => {
    async function checkFavorite() {
      if (user && selectedEvent?.id) {
        try {
          const favorite = await isEventFavorite(user.uid, selectedEvent.id);
          setIsFavorite(favorite);
        } catch (err) {
          console.error("Erreur lors de la vérification des favoris:", err);
        }
      }
    }

    checkFavorite();
  }, [user, selectedEvent]);

  const handleFavoriteClick = async () => {
    if (!user || !selectedEvent?.id) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(user.uid, selectedEvent.id);
      } else {
        await addToFavorites(user.uid, selectedEvent.id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Erreur lors de la gestion des favoris:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const searchCity = async (query: string) => {
    if (!query.trim()) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5`,
      );
      const data = await response.json();
      setCitySuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erreur lors de la recherche de ville:", error);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    searchCity(value);
  };

  const handleCitySelect = (city: string) => {
    setLocation(city);
    setShowSuggestions(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Rediriger vers la page découvrir avec les paramètres de recherche
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.append("search", searchTerm);
    if (location) searchParams.append("location", location);

    router.push(`/events?${searchParams.toString()}`);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Découvrez des événements exceptionnels
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Trouvez et participez à des événements uniques près de chez vous
          </p>
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-3xl mx-auto"
          >
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative w-full md:w-auto">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ville"
                value={location}
                onChange={handleCityChange}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {showSuggestions && citySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {citySuggestions.map((feature, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      onClick={() => handleCitySelect(feature.properties.city)}
                    >
                      {feature.properties.city}
                      <span className="text-sm text-gray-500 ml-2">
                        ({feature.properties.postcode})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 container px-4 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Événements à la une</h2>
          <Link
            href="/events"
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Voir tous les événements
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => {
                  setSelectedEvent(event);
                  setOpenModal(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          show={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedEvent(null);
          }}
          isFavorite={isFavorite}
          onFavoriteClick={handleFavoriteClick}
          favoriteLoading={favoriteLoading}
          showFavoriteButton={!!user}
        />
      )}
    </main>
  );
}
