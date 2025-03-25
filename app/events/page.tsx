"use client";

/**
 * @file page.tsx
 * @brief Events listing page component
 * @details Provides event browsing functionality with search, filtering, and favorite management
 */

import React, { useEffect, useState, Suspense } from "react";
import { getAllEvents, type Event } from "@/lib/db/events";
import { Calendar, MapPin, Clock, Search, Phone, Globe, Info, Repeat, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Modal, Carousel } from "flowbite-react";
import { useAuth } from "@/context/auth-context";
import { addToFavorites, removeFromFavorites, isEventFavorite } from "@/lib/db/favorites";
import { useSearchParams } from "next/navigation";

/**
 * @interface CityFeature
 * @brief City suggestion data structure
 */
interface CityFeature {
  properties: {
    city: string;
    postcode: string;
    context: string;
  };
}

/**
 * SearchParamsHandler component to handle URL search parameters
 */
function SearchParamsHandler({
  setSearchTerm,
  setLocation,
}: {
  setSearchTerm: (value: string) => void;
  setLocation: (value: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    const locationFromUrl = searchParams.get("location");

    if (searchFromUrl) setSearchTerm(searchFromUrl);
    if (locationFromUrl) setLocation(locationFromUrl);
  }, [searchParams, setSearchTerm, setLocation]);

  return null;
}

/**
 * @brief Events listing component
 * @details Main component for displaying and filtering events. Features include:
 *          - Event search and filtering
 *          - Category selection
 *          - Price range filtering
 *          - Date range filtering
 *          - Location-based filtering
 *          - Favorites management
 *          - Event detail modal
 *
 * @returns React component for events page
 */
export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CityFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const allEvents = await getAllEvents();
        setEvents(allEvents);
      } catch (err) {
        setError("Erreur lors du chargement des événements");
        console.error(err);
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

  const categories = Array.from(new Set(events.flatMap((event) => event.categories))).sort();

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = !location || event.location.toLowerCase().includes(location.toLowerCase());

    const matchesCategory = !selectedCategory || event.categories.includes(selectedCategory);

    const matchesPriceRange =
      (event.price >= priceRange[0] && event.price <= priceRange[1]) || (event.price === 0 && priceRange[0] === 0);

    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);

    const matchesDateRange =
      (!startDate || eventStartDate >= new Date(startDate)) && (!endDate || eventEndDate <= new Date(endDate));

    return matchesSearch && matchesLocation && matchesCategory && matchesPriceRange && matchesDateRange;
  });

  const formatEventDate = (event: Event) => {
    if (event.isRecurring) {
      const days = event.recurringDays.map((day) => {
        switch (day) {
          case "monday":
            return "Lundi";
          case "tuesday":
            return "Mardi";
          case "wednesday":
            return "Mercredi";
          case "thursday":
            return "Jeudi";
          case "friday":
            return "Vendredi";
          case "saturday":
            return "Samedi";
          case "sunday":
            return "Dimanche";
          default:
            return "";
        }
      });
      return `Tous les ${days.join(", ")}`;
    }

    try {
      const startDate = format(new Date(event.startDate), "PPP", { locale: fr });
      const endDate = format(new Date(event.endDate), "PPP", { locale: fr });

      if (startDate === endDate) {
        return startDate;
      }
      return `Du ${startDate} au ${endDate}`;
    } catch (err) {
      return "Date non définie";
    }
  };

  const formatEventTime = (event: Event) => {
    if (!event.startTime || !event.endTime) {
      return "Horaire non défini";
    }

    try {
      const startTime = format(new Date(`2000-01-01T${event.startTime}`), "HH:mm");
      const endTime = format(new Date(`2000-01-01T${event.endTime}`), "HH:mm");
      return `${startTime} - ${endTime}`;
    } catch (err) {
      return "Horaire non défini";
    }
  };

  const renderEventImage = (src: string | undefined, alt: string) => {
    if (!src) {
      return (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <Calendar className="w-12 h-12 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Suspense>
        <SearchParamsHandler setSearchTerm={setSearchTerm} setLocation={setLocation} />
      </Suspense>

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Découvrir les événements</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ville"
                value={location}
                onChange={handleCityChange}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                      <span className="text-sm text-gray-500 ml-2">({feature.properties.postcode})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="md:col-span-3 flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <label className="block text-sm font-medium">Prix</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    className="w-20 p-2 border rounded-md"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    placeholder="Min"
                  />
                  <span>à</span>
                  <input
                    type="number"
                    className="w-20 p-2 border rounded-md"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium">Période</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    className="w-40 p-2 border rounded-md"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span>à</span>
                  <input
                    type="date"
                    className="w-40 p-2 border rounded-md"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Aucun événement trouvé</h2>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  setOpenModal(true);
                }}
                className="cursor-pointer"
              >
                <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden group">
                    {renderEventImage(event.images?.[0], event.title)}
                    <div className="absolute top-4 left-4">
                      {event.categories.map((category, index) => (
                        <span key={index} className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full mr-2">
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`${event.isPaid ? "bg-primary" : "bg-green-500"} text-white text-sm font-semibold px-3 py-1 rounded-full`}
                      >
                        {event.isPaid ? `${event.price} €` : "Gratuit"}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>
                    <div className="space-y-2 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        {event.isRecurring ? <Repeat className="w-4 h-4 mr-1" /> : <Calendar className="w-4 h-4 mr-1" />}
                        <span>{formatEventDate(event)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatEventTime(event)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          show={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedEvent(null);
          }}
          size="4xl"
        >
          {selectedEvent && (
            <>
              <Modal.Header>
                <div className="text-2xl font-bold">{selectedEvent.title}</div>
              </Modal.Header>
              <Modal.Body>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-[300px] rounded-lg overflow-hidden">
                    {selectedEvent.images && selectedEvent.images.length > 0 ? (
                      <Carousel slideInterval={5000} className="h-full">
                        {selectedEvent.images.map((image, index) => (
                          <div key={index} className="relative h-full">
                            {renderEventImage(image, `${selectedEvent.title} ${index + 1}`)}
                          </div>
                        ))}
                      </Carousel>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.categories.map((category, index) => (
                        <span key={index} className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full">
                          {category}
                        </span>
                      ))}
                      <span
                        className={`${selectedEvent.isPaid ? "bg-primary" : "bg-green-500"} text-white text-sm font-semibold px-3 py-1 rounded-full`}
                      >
                        {selectedEvent.isPaid ? `${selectedEvent.price} €` : "Gratuit"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        {selectedEvent.isRecurring ? (
                          <Repeat className="w-5 h-5 mr-2" />
                        ) : (
                          <Calendar className="w-5 h-5 mr-2" />
                        )}
                        <span>{formatEventDate(selectedEvent)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-2" />
                        <span>{formatEventTime(selectedEvent)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-lg font-semibold mb-2">Description</div>
                      <p className="text-gray-600">{selectedEvent.description}</p>
                    </div>

                    {(selectedEvent.organizerPhone || selectedEvent.organizerWebsite) && (
                      <div className="space-y-2">
                        <div className="text-lg font-semibold">Contact</div>
                        {selectedEvent.organizerPhone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-5 h-5 mr-2" />
                            <a href={`tel:${selectedEvent.organizerPhone}`} className="hover:text-primary">
                              {selectedEvent.organizerPhone}
                            </a>
                          </div>
                        )}
                        {selectedEvent.organizerWebsite && (
                          <div className="flex items-center text-gray-600">
                            <Globe className="w-5 h-5 mr-2" />
                            <a
                              href={selectedEvent.organizerWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              {selectedEvent.organizerWebsite}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-lg font-semibold">Informations pratiques</div>
                      <div className="flex items-start text-gray-600">
                        <Info className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                        <ul className="list-disc list-inside space-y-1">
                          {selectedEvent.isAccessible && <li>Accessible aux personnes à mobilité réduite</li>}
                          {selectedEvent.hasParking && <li>Parking disponible</li>}
                          {selectedEvent.hasPublicTransport && <li>Transport en commun à proximité</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div className="flex justify-between w-full">
                  <button
                    onClick={() => {
                      setOpenModal(false);
                      setSelectedEvent(null);
                    }}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Fermer
                  </button>
                  {user && (
                    <button
                      onClick={handleFavoriteClick}
                      disabled={favoriteLoading}
                      className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                        isFavorite ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                      {favoriteLoading ? "Chargement..." : isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    </button>
                  )}
                </div>
              </Modal.Footer>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}
