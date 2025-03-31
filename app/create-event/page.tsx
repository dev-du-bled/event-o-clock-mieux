"use client";

/**
 * @file page.tsx
 * @brief Event creation page component
 * @details Handles the creation of new events with form validation and image upload
 */

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Upload,
  Tag,
  DollarSign,
  Info,
  Clock,
  Accessibility,
  Repeat,
} from "lucide-react";
import { createEvent, updateEvent } from "@/lib/db/events";
import { uploadEventImage } from "@/lib/storage";
import Link from "next/link";
import Image from "next/image";
import AddressFeature from "@/lib/types";
import { authClient } from "@/lib/auth/auth-client";

export default function CreateEvent() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressFeature[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<string[]>([]);

  /**
   * @interface FormData
   * @description Represents the state structure for an event creation form.
   * Contains all necessary fields to create a new event including basic details,
   * location information, and accessibility features.
   */
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    address: "",
    streetNumber: "",
    street: "",
    city: "",
    postalCode: "",
    description: "",
    price: "",
    organizerWebsite: "",
    organizerPhone: "",
    isAccessible: false,
    hasParking: false,
    hasPublicTransport: false,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Vous devez être connecté pour créer un événement
            </h2>
            <Link href="/login" className="text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    "Concert",
    "Festival",
    "Conférence",
    "Sport",
    "Art",
    "Gastronomie",
    "Technologie",
    "Bien-être",
    "Autre",
  ];

  const weekDays = [
    { id: "monday", label: "Lundi" },
    { id: "tuesday", label: "Mardi" },
    { id: "wednesday", label: "Mercredi" },
    { id: "thursday", label: "Jeudi" },
    { id: "friday", label: "Vendredi" },
    { id: "saturday", label: "Samedi" },
    { id: "sunday", label: "Dimanche" },
  ];

  function debounce<T extends (...args: string[]) => void>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const searchAddress = async (query: string) => {
    if (!query.trim()) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
      );
      const data = await response.json();
      setAddressSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse:", error);
    }
  };

  const debouncedSearchAddress = debounce(searchAddress, 300);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, address: value }));
    debouncedSearchAddress(value);
  };

  /**
   * @brief Handles address selection from suggestions
   * @param feature Selected address feature
   */
  const handleAddressSelect = (feature: AddressFeature) => {
    const { postcode, city, housenumber, street } = feature.properties;
    setFormData((prev) => ({
      ...prev,
      streetNumber: housenumber || "",
      street: street,
      address: `${housenumber ? housenumber + " " : ""}${street}`,
      city,
      postalCode: postcode,
    }));
    setShowSuggestions(false);
  };

  /**
   * @brief Handles image upload via file input
   * @param e Change event from file input
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  /**
   * @brief Handles drag and drop image upload
   * @param e Drag event object
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newImages = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  /*
   * @brief Handles drag over event for image upload
   * @param e Drag event object
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  /**
   * @brief Handles form submission
   * @param e Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Vous devez être connecté pour créer un événement");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("Veuillez sélectionner au moins une catégorie");
      return;
    }

    if (isRecurring && recurringDays.length === 0) {
      setError(
        "Veuillez sélectionner au moins un jour de la semaine pour un événement récurrent",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const eventData = {
        ...formData,
        categories: selectedCategories,
        isPaid,
        price: isPaid ? parseFloat(formData.price) : 0,
        createdBy: user.id,
        images: [],
        status: "PUBLISHED" as const,
        isRecurring,
        recurringDays: isRecurring ? recurringDays : [],
        recurringEndDate: null,
      };

      const eventId = await createEvent(eventData);

      const imageUrls = await Promise.all(
        images.map((image) => uploadEventImage(image, eventId)),
      );

      await updateEvent(eventId, { images: imageUrls });

      router.push("/my-events");
    } catch (err) {
      setError("Une erreur est survenue lors de la création de l'événement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Créer un événement</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-6 space-y-6"
        >
          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de l&apos;événement *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Ex: Concert de Jazz au Parc"
            />
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                <Repeat className="inline-block w-4 h-4 mr-2" />
                Événement récurrent
              </span>
            </label>

            {isRecurring && (
              <div className="space-y-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jours de la semaine *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {weekDays.map((day) => (
                      <label
                        key={day.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={recurringDays.includes(day.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRecurringDays([...recurringDays, day.id]);
                            } else {
                              setRecurringDays(
                                recurringDays.filter((d) => d !== day.id),
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline-block w-4 h-4 mr-2" />
                      Heure de début *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline-block w-4 h-4 mr-2" />
                      Heure de fin *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dates (only for non-recurring events) */}
          {!isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline-block w-4 h-4 mr-2" />
                  Date et heure de début *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required={!isRecurring}
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <input
                    type="time"
                    required={!isRecurring}
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline-block w-4 h-4 mr-2" />
                  Date et heure de fin *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required={!isRecurring}
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <input
                    type="time"
                    required={!isRecurring}
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Adress */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              <MapPin className="inline-block w-4 h-4 mr-2" />
              Adresse de l&apos;événement *
            </label>
            <div className="relative">
              <input
                type="text"
                ref={addressInputRef}
                value={formData.address}
                onChange={handleAddressChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Numéro et nom de la rue"
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {addressSuggestions.map((feature, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      onClick={() => handleAddressSelect(feature)}
                    >
                      {feature.properties.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Ville"
                required
              />
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Code postal"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Décrivez votre événement en détail..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="inline-block w-4 h-4 mr-2" />
              Images (max 5)
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="images"
              />
              <label htmlFor="images" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Cliquez pour sélectionner ou glissez-déposez vos images ici
                </p>
              </label>
            </div>
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, i) => i !== index))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline-block w-4 h-4 mr-2" />
              Catégories *
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    if (selectedCategories.includes(category)) {
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== category),
                      );
                    } else {
                      setSelectedCategories([...selectedCategories, category]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategories.includes(category)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Accessibility className="inline-block w-4 h-4 mr-2" />
              Accessibilité
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAccessible}
                  onChange={(e) =>
                    setFormData({ ...formData, isAccessible: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2">
                  Accessible aux personnes à mobilité réduite
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasParking}
                  onChange={(e) =>
                    setFormData({ ...formData, hasParking: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2">Parking disponible</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasPublicTransport}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasPublicTransport: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2">Transport en commun à proximité</span>
              </label>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline-block w-4 h-4 mr-2" />
              Prix
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!isPaid}
                  onChange={() => setIsPaid(false)}
                  className="form-radio text-primary"
                />
                <span className="ml-2">Gratuit</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={isPaid}
                  onChange={() => setIsPaid(true)}
                  className="form-radio text-primary"
                />
                <span className="ml-2">Payant</span>
              </label>
            </div>
            {isPaid && (
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Prix en euros"
                step="0.01"
                min="0"
              />
            )}
          </div>

          {/* Contact information  */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Info className="inline-block w-4 h-4 mr-2" />
              Informations de contact (optionnel)
            </label>
            <div className="space-y-4">
              <input
                type="url"
                value={formData.organizerWebsite}
                onChange={(e) =>
                  setFormData({ ...formData, organizerWebsite: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Site web"
              />
              <input
                type="tel"
                value={formData.organizerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, organizerPhone: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Création en cours..." : "Créer l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}
