"use client";

/**
 * @file page.tsx
 * @brief Event creation page component
 * @details Handles the creation of new events with form validation (using Zod) and image upload
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
  AlertCircle, // Import pour l'icône d'erreur
} from "lucide-react";
import { createEvent, updateEvent } from "@/lib/db/events";
import { uploadEventImage } from "@/lib/storage";
import Image from "next/image";
import AddressFeature from "@/lib/types";
import { authClient } from "@/lib/auth/auth-client";
import { z } from "zod"; // Importer Zod
import {
  createEventSchema,
  CreateEventFormData as ZodFormData, // Importer le schéma et le type
} from "@/schemas/createEvent"; // Assurez-vous que le chemin est correct
import NoAuth from "@/components/auth/no-auth";

// Helper type pour les erreurs Zod formatées
type FieldErrors = z.inferFlattenedErrors<
  typeof createEventSchema
>["fieldErrors"];

export default function CreateEvent() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Pour les erreurs générales/API
  const [formErrors, setFormErrors] = useState<FieldErrors>({}); // Pour les erreurs Zod
  const [images, setImages] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressFeature[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<
    ZodFormData["recurringDays"]
  >([]);

  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    address: "",
    // streetNumber: "", // Géré via address et sélection
    // street: "", // Géré via address et sélection
    city: "",
    postalCode: "",
    description: "",
    price: "", // Garder comme string ici, Zod validera
    organizerWebsite: "",
    organizerPhone: "",
    isAccessible: false,
    hasParking: false,
    hasPublicTransport: false,
  });

  if (!user) {
    return <NoAuth />;
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

  const weekDays: {
    id: ZodFormData["recurringDays"][number];
    label: string;
  }[] = [
    { id: "monday", label: "Lundi" },
    { id: "tuesday", label: "Mardi" },
    { id: "wednesday", label: "Mercredi" },
    { id: "thursday", label: "Jeudi" },
    { id: "friday", label: "Vendredi" },
    { id: "saturday", label: "Samedi" },
    { id: "sunday", label: "Dimanche" },
  ];

  // --- Fonctions debounce, searchAddress, handleAddressChange, handleAddressSelect ---
  // --- handleImageChange, handleDrop, handleDragOver ---
  // (Ces fonctions restent inchangées)
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
      console.error("Erreur lors de la recherche d'adresse:", error);
    }
  };

  const debouncedSearchAddress = debounce(searchAddress, 300);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value }));
    // Réinitialiser les erreurs pour ce champ lors de la saisie
    setFormErrors(prev => ({ ...prev, address: undefined }));
    debouncedSearchAddress(value);
  };

  const handleAddressSelect = (feature: AddressFeature) => {
    const { postcode, city, housenumber, street } = feature.properties;
    const fullAddress = `${housenumber ? housenumber + " " : ""}${street}`;
    setFormData(prev => ({
      ...prev,
      // streetNumber: housenumber || "", // Pas dans le state direct
      // street: street, // Pas dans le state direct
      address: fullAddress,
      city,
      postalCode: postcode,
    }));
    // Réinitialiser les erreurs liées à l'adresse après sélection
    setFormErrors(prev => ({
      ...prev,
      address: undefined,
      city: undefined,
      postalCode: undefined,
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

  // --- FIN Fonctions inchangées ---

  /**
   * @brief Handles form submission with Zod validation
   * @param e Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Vous devez être connecté pour créer un événement");
      return;
    }

    // 1. Préparer les données pour la validation Zod
    const dataToValidate: ZodFormData = {
      ...formData,
      categories: selectedCategories,
      isPaid,
      isRecurring,
      recurringDays: isRecurring ? recurringDays : [], // Fournir tableau vide si non récurrent
      // Zod attend 'price' comme string ici, la validation/conversion se fait dans superRefine
      price: isPaid ? formData.price : undefined, // Mettre undefined si gratuit
      // startDate et endDate peuvent être vides si isRecurring est true, Zod gère ça
    };

    // 2. Valider avec Zod
    const validationResult = createEventSchema.safeParse(dataToValidate);

    // 3. Gérer le résultat de la validation
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      setFormErrors(errors);
      setError(""); // Effacer l'erreur générale s'il y en avait une
      setLoading(false); // Assurer que le chargement est arrêté
      // Optionnel: faire défiler vers la première erreur
      // const firstErrorField = Object.keys(errors)[0];
      // document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return; // Arrêter la soumission
    }

    // 4. Validation réussie - Continuer avec la logique de création
    setLoading(true);
    setError("");
    setFormErrors({}); // Effacer les erreurs précédentes

    try {
      // Utiliser les données validées (result.data)
      const validatedData = validationResult.data;

      const eventData = {
        ...validatedData,
        // Ensure required fields startDate and endDate are defined (non-null)
        startDate: validatedData.startDate!,
        endDate: validatedData.endDate!,
        // Assurer la conversion correcte du prix en nombre pour la DB
        price: validatedData.isPaid
          ? parseFloat(validatedData.price!) // Le '!' est sûr ici grâce à superRefine
          : 0,
        createdBy: user.id,
        images: [], // Sera mis à jour après l'upload
        status: "PUBLISHED" as const,
        // Ajouter les champs manquants pour correspondre à Omit<Event, ...>
        streetNumber: "", // défaut si non géré séparément
        street: "", // défaut si non géré séparément
        recurringEndDate: null, // ou une Date si défini dans le schéma
      };

      // Supprimer les champs non nécessaires pour createEvent si besoin
      // delete (eventData as any).isPaid; // Exemple si isPaid n'est pas dans le modèle DB direct

      const eventId = await createEvent(eventData);

      const imageUrls = await Promise.all(
        images.map(image => uploadEventImage(image, eventId))
      );

      await updateEvent(eventId, { images: imageUrls });

      router.push("/my-events");
    } catch (err) {
      setError(
        "Une erreur est survenue lors de la création de l'événement. Veuillez réessayer."
      );
      console.error("Erreur handleSubmit:", err);
      setFormErrors({}); // Effacer les erreurs de champ en cas d'erreur API
    } finally {
      setLoading(false);
    }
  };

  // Helper pour afficher les erreurs Zod
  const FieldError = ({ fieldName }: { fieldName: keyof FieldErrors }) => {
    if (!formErrors[fieldName]?.[0]) return null;
    return (
      <div className="mt-1 flex items-center text-sm text-red-600">
        <AlertCircle className="mr-1 h-4 w-4" />
        {formErrors[fieldName]?.[0]}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Créer un événement</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-6 space-y-6"
          noValidate // Désactiver la validation HTML pour se fier entièrement à Zod/JS
        >
          {/* Affichage de l'erreur générale/API */}
          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Titre de l&apos;événement *
            </label>
            <input
              id="title"
              name="title" // Important pour le ciblage potentiel des erreurs
              type="text"
              required // Garder pour accessibilité/UX de base
              value={formData.title}
              onChange={e => {
                setFormData({ ...formData, title: e.target.value });
                setFormErrors(prev => ({ ...prev, title: undefined })); // Clear error on change
              }}
              className={`w-full rounded-lg border ${
                formErrors.title ? "border-red-500" : "border-gray-300"
              } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
              placeholder="Ex: Concert de Jazz au Parc"
              aria-invalid={!!formErrors.title}
              aria-describedby={formErrors.title ? "title-error" : undefined}
            />
            <div id="title-error">
              <FieldError fieldName="title" />
            </div>
          </div>

          {/* Récurrence Checkbox */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => {
                  setIsRecurring(e.target.checked);
                  // Effacer les erreurs liées aux dates/récurrence lors du changement
                  setFormErrors(prev => ({
                    ...prev,
                    startDate: undefined,
                    endDate: undefined,
                    startTime: undefined, // Peut aussi dépendre de la logique
                    endTime: undefined, // Peut aussi dépendre de la logique
                    recurringDays: undefined,
                  }));
                }}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                <Repeat className="inline-block w-4 h-4 mr-2" />
                Événement récurrent
              </span>
            </label>

            {/* Champs spécifiques à la récurrence */}
            {isRecurring && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200 ml-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jours de la semaine *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {weekDays.map(day => (
                      <label
                        key={day.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={recurringDays.includes(day.id)}
                          onChange={e => {
                            const checked = e.target.checked;
                            let updatedDays: ZodFormData["recurringDays"];
                            if (checked) {
                              updatedDays = [...recurringDays, day.id];
                            } else {
                              updatedDays = recurringDays.filter(
                                d => d !== day.id
                              );
                            }
                            setRecurringDays(updatedDays);
                            // Clear error on change if days are selected
                            if (updatedDays.length > 0) {
                              setFormErrors(prev => ({
                                ...prev,
                                recurringDays: undefined,
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>{day.label}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError fieldName="recurringDays" />
                </div>

                {/* Heures pour récurrent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="recurringStartTime"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      <Clock className="inline-block w-4 h-4 mr-2" />
                      Heure de début *
                    </label>
                    <input
                      id="recurringStartTime"
                      name="startTime" // Nom commun pour Zod
                      type="time"
                      value={formData.startTime}
                      onChange={e => {
                        setFormData({
                          ...formData,
                          startTime: e.target.value,
                        });
                        setFormErrors(prev => ({
                          ...prev,
                          startTime: undefined,
                        }));
                      }}
                      className={`w-full rounded-lg border ${
                        formErrors.startTime
                          ? "border-red-500"
                          : "border-gray-300"
                      } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      aria-invalid={!!formErrors.startTime}
                      aria-describedby={
                        formErrors.startTime ? "startTime-error" : undefined
                      }
                    />
                    <div id="startTime-error">
                      <FieldError fieldName="startTime" />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="recurringEndTime"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      <Clock className="inline-block w-4 h-4 mr-2" />
                      Heure de fin *
                    </label>
                    <input
                      id="recurringEndTime"
                      name="endTime" // Nom commun pour Zod
                      type="time"
                      value={formData.endTime}
                      onChange={e => {
                        setFormData({ ...formData, endTime: e.target.value });
                        setFormErrors(prev => ({
                          ...prev,
                          endTime: undefined,
                        }));
                      }}
                      className={`w-full rounded-lg border ${
                        formErrors.endTime
                          ? "border-red-500"
                          : "border-gray-300"
                      } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      aria-invalid={!!formErrors.endTime}
                      aria-describedby={
                        formErrors.endTime ? "endTime-error" : undefined
                      }
                    />
                    <div id="endTime-error">
                      <FieldError fieldName="endTime" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dates spécifiques (non-récurrent) */}
          {!isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date/Heure Début */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline-block w-4 h-4 mr-2" />
                  Date et heure de début *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={e => {
                        setFormData({
                          ...formData,
                          startDate: e.target.value,
                        });
                        setFormErrors(prev => ({
                          ...prev,
                          startDate: undefined,
                          endDate: undefined, // Aussi pour l'erreur de chronologie
                        }));
                      }}
                      className={`w-full rounded-lg border ${
                        formErrors.startDate
                          ? "border-red-500"
                          : "border-gray-300"
                      } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      aria-invalid={!!formErrors.startDate}
                      aria-describedby={
                        formErrors.startDate ? "startDate-error" : undefined
                      }
                    />
                    <div id="startDate-error">
                      <FieldError fieldName="startDate" />
                    </div>
                  </div>
                  <div>
                    <input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={e => {
                        setFormData({
                          ...formData,
                          startTime: e.target.value,
                        });
                        setFormErrors(prev => ({
                          ...prev,
                          startTime: undefined,
                          endDate: undefined, // Aussi pour l'erreur de chronologie
                          endTime: undefined, // Aussi pour l'erreur de chronologie
                        }));
                      }}
                      className={`w-full rounded-lg border ${
                        formErrors.startTime
                          ? "border-red-500"
                          : "border-gray-300"
                      } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      aria-invalid={!!formErrors.startTime}
                      aria-describedby={
                        formErrors.startTime ? "startTime-error" : undefined
                      }
                    />
                    <div id="startTime-error">
                      <FieldError fieldName="startTime" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Date/Heure Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline-block w-4 h-4 mr-2" />
                  Date et heure de fin *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={e => {
                        setFormData({ ...formData, endDate: e.target.value });
                        setFormErrors(prev => ({
                          ...prev,
                          endDate: undefined,
                        }));
                      }}
                      className={`w-full rounded-lg border ${
                        formErrors.endDate
                          ? "border-red-500"
                          : "border-gray-300"
                      } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      aria-invalid={!!formErrors.endDate}
                      aria-describedby={
                        formErrors.endDate ? "endDate-error" : undefined
                      }
                    />
                    <div id="endDate-error">
                      <FieldError fieldName="endDate" />
                    </div>
                  </div>
                  <div>
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={e => {
                        setFormData({ ...formData, endTime: e.target.value });
                        setFormErrors(prev => ({
                          ...prev,
                          endTime: undefined,
                          endDate: undefined, // Aussi pour l'erreur de chronologie
                        }));
                      }}
                      className={`w-full rounded-lg border ${
                        formErrors.endTime
                          ? "border-red-500"
                          : "border-gray-300"
                      } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      aria-invalid={!!formErrors.endTime}
                      aria-describedby={
                        formErrors.endTime ? "endTime-error" : undefined
                      }
                    />
                    <div id="endTime-error">
                      <FieldError fieldName="endTime" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Adresse */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              <MapPin className="inline-block w-4 h-4 mr-2" />
              Adresse de l&apos;événement *
            </label>
            <div className="relative">
              <input
                id="address"
                name="address"
                type="text"
                ref={addressInputRef}
                value={formData.address}
                onChange={handleAddressChange} // Gère déjà le clear error
                className={`w-full rounded-lg border ${
                  formErrors.address ? "border-red-500" : "border-gray-300"
                } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                placeholder="Numéro et nom de la rue"
                autoComplete="off"
                aria-invalid={!!formErrors.address}
                aria-describedby={
                  formErrors.address ? "address-error" : undefined
                }
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {addressSuggestions.map((feature, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      onClick={() => handleAddressSelect(feature)} // Gère déjà le clear error
                    >
                      {feature.properties.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div id="address-error">
              <FieldError fieldName="address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={e => {
                    setFormData({ ...formData, city: e.target.value });
                    setFormErrors(prev => ({ ...prev, city: undefined }));
                  }}
                  className={`w-full rounded-lg border ${
                    formErrors.city ? "border-red-500" : "border-gray-300"
                  } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                  placeholder="Ville"
                  required
                  aria-invalid={!!formErrors.city}
                  aria-describedby={formErrors.city ? "city-error" : undefined}
                />
                <div id="city-error">
                  <FieldError fieldName="city" />
                </div>
              </div>
              <div>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={e => {
                    setFormData({ ...formData, postalCode: e.target.value });
                    setFormErrors(prev => ({
                      ...prev,
                      postalCode: undefined,
                    }));
                  }}
                  className={`w-full rounded-lg border ${
                    formErrors.postalCode ? "border-red-500" : "border-gray-300"
                  } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                  placeholder="Code postal"
                  required
                  maxLength={5}
                  aria-invalid={!!formErrors.postalCode}
                  aria-describedby={
                    formErrors.postalCode ? "postalCode-error" : undefined
                  }
                />
                <div id="postalCode-error">
                  <FieldError fieldName="postalCode" />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description détaillée *
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={e => {
                setFormData({ ...formData, description: e.target.value });
                setFormErrors(prev => ({ ...prev, description: undefined }));
              }}
              rows={5}
              className={`w-full rounded-lg border ${
                formErrors.description ? "border-red-500" : "border-gray-300"
              } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
              placeholder="Décrivez votre événement en détail..."
              aria-invalid={!!formErrors.description}
              aria-describedby={
                formErrors.description ? "description-error" : undefined
              }
            />
            <div id="description-error">
              <FieldError fieldName="description" />
            </div>
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
                      width={100}
                      height={100}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, i) => i !== index))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs leading-none hover:bg-red-600"
                      aria-label={`Supprimer l'image ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Note: Zod ne valide pas directement les fichiers ici, mais on pourrait ajouter une validation sur images.length si besoin */}
          </div>

          {/* Catégories */}
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
                    let updatedCategories: string[];
                    if (selectedCategories.includes(category)) {
                      updatedCategories = selectedCategories.filter(
                        c => c !== category
                      );
                    } else {
                      updatedCategories = [...selectedCategories, category];
                    }
                    setSelectedCategories(updatedCategories);
                    // Clear error on change if categories are selected
                    if (updatedCategories.length > 0) {
                      setFormErrors(prev => ({
                        ...prev,
                        categories: undefined,
                      }));
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategories.includes(category)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${
                    formErrors.categories && selectedCategories.length === 0
                      ? "ring-2 ring-offset-1 ring-red-500" // Highlight if error and none selected
                      : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <FieldError fieldName="categories" />
          </div>

          {/* Accessibilité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Accessibility className="inline-block w-4 h-4 mr-2" />
              Accessibilité
            </label>
            <div className="space-y-2">
              {/* Checkboxes pour isAccessible, hasParking, hasPublicTransport */}
              {/* (Code inchangé pour ces checkboxes) */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAccessible}
                  onChange={e =>
                    setFormData({ ...formData, isAccessible: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Accessible aux personnes à mobilité réduite
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasParking}
                  onChange={e =>
                    setFormData({ ...formData, hasParking: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Parking disponible
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
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
                <span className="ml-2 text-sm text-gray-600">
                  Transport en commun à proximité
                </span>
              </label>
            </div>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline-block w-4 h-4 mr-2" />
              Prix *
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentType" // Important pour grouper les radios
                  checked={!isPaid}
                  onChange={() => {
                    setIsPaid(false);
                    setFormData({ ...formData, price: "" }); // Clear price when switching to free
                    setFormErrors(prev => ({ ...prev, price: undefined })); // Clear price error
                  }}
                  className="form-radio text-primary"
                />
                <span className="ml-2 text-sm text-gray-600">Gratuit</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  checked={isPaid}
                  onChange={() => setIsPaid(true)}
                  className="form-radio text-primary"
                />
                <span className="ml-2 text-sm text-gray-600">Payant</span>
              </label>
            </div>
            {isPaid && (
              <div className="mt-2">
                <input
                  id="price"
                  name="price"
                  type="number" // Garder type number pour UX (flèches, etc.)
                  value={formData.price}
                  onChange={e => {
                    setFormData({ ...formData, price: e.target.value });
                    setFormErrors(prev => ({ ...prev, price: undefined }));
                  }}
                  className={`w-full rounded-lg border ${
                    formErrors.price ? "border-red-500" : "border-gray-300"
                  } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                  placeholder="Prix en euros"
                  step="0.01"
                  min="0"
                  aria-invalid={!!formErrors.price}
                  aria-describedby={
                    formErrors.price ? "price-error" : undefined
                  }
                />
                <div id="price-error">
                  <FieldError fieldName="price" />
                </div>
              </div>
            )}
            {/* Afficher l'erreur de prix même si le champ n'est pas visible (cas où on passe de payant à gratuit sans vider) */}
            {!isPaid && <FieldError fieldName="price" />}
          </div>

          {/* Informations de contact (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Info className="inline-block w-4 h-4 mr-2" />
              Informations de contact (optionnel)
            </label>
            <div className="space-y-4">
              <div>
                <input
                  id="organizerWebsite"
                  name="organizerWebsite"
                  type="url"
                  value={formData.organizerWebsite}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      organizerWebsite: e.target.value,
                    });
                    setFormErrors(prev => ({
                      ...prev,
                      organizerWebsite: undefined,
                    }));
                  }}
                  className={`w-full rounded-lg border ${
                    formErrors.organizerWebsite
                      ? "border-red-500"
                      : "border-gray-300"
                  } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                  placeholder="Site web (ex: https://monsite.com)"
                  aria-invalid={!!formErrors.organizerWebsite}
                  aria-describedby={
                    formErrors.organizerWebsite
                      ? "organizerWebsite-error"
                      : undefined
                  }
                />
                <div id="organizerWebsite-error">
                  <FieldError fieldName="organizerWebsite" />
                </div>
              </div>
              <div>
                <input
                  id="organizerPhone"
                  name="organizerPhone"
                  type="tel"
                  value={formData.organizerPhone}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      organizerPhone: e.target.value,
                    });
                    setFormErrors(prev => ({
                      ...prev,
                      organizerPhone: undefined,
                    }));
                  }}
                  className={`w-full rounded-lg border ${
                    formErrors.organizerPhone
                      ? "border-red-500"
                      : "border-gray-300"
                  } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                  placeholder="Numéro de téléphone"
                  aria-invalid={!!formErrors.organizerPhone}
                  aria-describedby={
                    formErrors.organizerPhone
                      ? "organizerPhone-error"
                      : undefined
                  }
                />
                <div id="organizerPhone-error">
                  <FieldError fieldName="organizerPhone" />
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {loading ? "Création en cours..." : "Créer l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}
