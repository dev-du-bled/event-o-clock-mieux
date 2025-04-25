"use client";

import { CityFeature } from "@/types/types";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchEvent() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CityFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchCity = async (query: string) => {
    if (!query.trim()) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5`
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
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  {feature.properties.postcode}
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
  );
}
