"use client";

/**
 * @file page.tsx
 * @brief Event editing page component
 * @details Provides functionality to edit existing events including form handling,
 *          image management, and address validation
 */
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
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
import { updateEvent } from "@/lib/db/events";
import { uploadEventImage } from "@/lib/storage";
import Link from "next/link";
import AddressFeature from "@/lib/types";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";
import NoAuth from "@/components/auth/no-auth";

export default function EditEvent() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressFeature[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const { id } = router.query;
  const eventID =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : undefined;

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

  useEffect(() => {
    async function loadEvent() {
      if (!user || !eventID) return;

      try {
        const eventDoc = await getDoc(doc(db, "events", eventID));
        if (!eventDoc.exists()) {
          setError("Événement non trouvé");
          return;
        }

        const eventData = eventDoc.data();

        // Check if user is the creator of the event
        if (eventData.createdBy !== user.id) {
          setError("Vous n&apos;êtes pas autorisé à modifier cet événement");
          return;
        }

        setFormData({
          title: eventData.title,
          startDate: eventData.startDate || "",
          startTime: eventData.startTime || "",
          endDate: eventData.endDate || "",
          endTime: eventData.endTime || "",
          address: eventData.address || "",
          streetNumber: eventData.streetNumber || "",
          street: eventData.street || "",
          city: eventData.city || "",
          postalCode: eventData.postalCode || "",
          description: eventData.description,
          price: eventData.price?.toString() || "",
          organizerWebsite: eventData.organizerWebsite || "",
          organizerPhone: eventData.organizerPhone || "",
          isAccessible: eventData.isAccessible || false,
          hasParking: eventData.hasParking || false,
          hasPublicTransport: eventData.hasPublicTransport || false,
        });

        setSelectedCategories(eventData.categories || []);
        setIsPaid(eventData.isPaid || false);
        setIsRecurring(eventData.isRecurring || false);
        setRecurringDays(eventData.recurringDays || []);
        setExistingImages(eventData.images || []);
        setInitialLoad(false);
      } catch (err) {
        console.error("Erreur lors du chargement de l&apos;événement:", err);
        setError("Erreur lors du chargement de l&apos;événement");
      }
    }

    loadEvent();
  }, [eventID, user]);

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

  /*
   * Debounce function to limit the number of API calls when searching for addresses
   * @param func The function to debounce
   * @param wait The time to wait before executing the function
   * @returns The debounced function
   *
   */

  function debounce<T extends (...args: string[]) => void>(
    func: T,
    wait: number
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

  /*
   * Search for an address using the API Adresse
   * @param query The address query
   *
   */

  const searchAddress = async (query: string) => {
    if (!query.trim()) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erreur lors de la recherche d&apos;adresse:", error);
    }
  };

  /*
   * Handle the address change event
   * @param e The input change event
   *
   */
  const debouncedSearchAddress = debounce(searchAddress, 300);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value }));
    debouncedSearchAddress(value);
  };

  const handleAddressSelect = (feature: AddressFeature) => {
    const { postcode, city, housenumber, street } = feature.properties;
    setFormData(prev => ({
      ...prev,
      streetNumber: housenumber || "",
      street: street,
      address: `${housenumber ? housenumber + " " : ""}${street}`,
      city,
      postalCode: postcode,
    }));
    setShowSuggestions(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newImages = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith("image/")
      );
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Vous devez être connecté pour modifier un événement");
      return;
    }

    if (!eventID) {
      setError("Identifiant d&apos;événement invalide");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("Veuillez sélectionner au moins une catégorie");
      return;
    }

    if (isRecurring && recurringDays.length === 0) {
      setError(
        "Veuillez sélectionner au moins un jour de la semaine pour un événement récurrent"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const eventData = {
        ...formData,
        location:
          `${formData.streetNumber} ${formData.street}, ${formData.postalCode} ${formData.city}`.trim(),
        categories: selectedCategories,
        isPaid,
        price: isPaid ? parseFloat(formData.price) : 0,
        isRecurring,
        recurringDays: isRecurring ? recurringDays : [],
        recurringEndDate: null,
      };

      // Upload new images if any
      const newImageUrls = await Promise.all(
        images.map(image => uploadEventImage(image, eventID))
      );

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      await updateEvent(eventID, {
        ...eventData,
        images: allImages,
      });

      router.push("/my-events");
    } catch (err) {
      setError(
        "Une erreur est survenue lors de la modification de l&apos;événement"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    return <NoAuth />;
  }

  if (initialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Modifier l&apos;événement</h1>

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
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Ex: Concert de Jazz au Parc"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
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
                    {weekDays.map(day => (
                      <label
                        key={day.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={recurringDays.includes(day.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setRecurringDays([...recurringDays, day.id]);
                            } else {
                              setRecurringDays(
                                recurringDays.filter(d => d !== day.id)
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
                      onChange={e =>
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
                      onChange={e =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

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
                    onChange={e =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <input
                    type="time"
                    required={!isRecurring}
                    value={formData.startTime}
                    onChange={e =>
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
                    onChange={e =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <input
                    type="time"
                    required={!isRecurring}
                    value={formData.endTime}
                    onChange={e =>
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
                onChange={e =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Ville"
                required
              />
              <input
                type="text"
                value={formData.postalCode}
                onChange={e =>
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
              onChange={e =>
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

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Images existantes :
                </p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Image existante ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-lg"
                        width={80}
                        height={80}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New images upload */}
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

            {/* New images preview */}
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg"
                      width={80}
                      height={80}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
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
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    if (selectedCategories.includes(category)) {
                      setSelectedCategories(
                        selectedCategories.filter(c => c !== category)
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
                  onChange={e =>
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
                  onChange={e =>
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
                  onChange={e =>
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

          {/* Prix */}
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
                onChange={e =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Prix en euros"
                step="0.01"
                min="0"
              />
            )}
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Info className="inline-block w-4 h-4 mr-2" />
              Informations de contact (optionnel)
            </label>
            <div className="space-y-4">
              <input
                type="url"
                value={formData.organizerWebsite}
                onChange={e =>
                  setFormData({ ...formData, organizerWebsite: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Site web"
              />
              <input
                type="tel"
                value={formData.organizerPhone}
                onChange={e =>
                  setFormData({ ...formData, organizerPhone: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/my-events"
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Modification en cours..."
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
