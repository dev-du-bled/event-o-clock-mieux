"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { createEvent, updateEvent } from "@/lib/db/events";
import { uploadEventImage } from "@/lib/storage";
import AddressFeature from "@/lib/types";
import { authClient } from "@/lib/auth/auth-client";
import { z } from "zod";
import {
  createEventSchema,
  CreateEventFormData as ZodFormData,
} from "@/schemas/createEvent";
import NoAuth from "@/components/auth/no-auth";
import EventDetailsForm from "./fields/EventDetailsForm";
import EventSchedulingForm from "./fields/EventSchedulingForm";
import EventLocationForm from "./fields/EventLocationForm";
import EventImageUpload from "./fields/EventImageUpload";
import EventFinancialsAndContactForm from "./fields/EventFinancialsAndContactForm";

// Helper type pour les erreurs Zod formatées
type FieldErrors = z.inferFlattenedErrors<
  typeof createEventSchema
>["fieldErrors"];

export default function CreateEventForm() {
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
    if (!isPaid) {
      setFormData(prev => ({ ...prev, price: "" }));
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.price;
        return newErrors;
      });
    }
  }, [isPaid, setFormData, setFormErrors]);

  useEffect(() => {
    // Clear relevant date/time errors when isRecurring toggles
    setFormErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors.startDate;
      delete newErrors.endDate;
      delete newErrors.startTime;
      delete newErrors.endTime;
      delete newErrors.recurringDays; // Clear recurringDays errors as per original logic on any toggle
      return newErrors;
    });

    if (!isRecurring) {
      setRecurringDays([]); // Reset recurring days selection if not recurring
    }
  }, [isRecurring, setFormErrors, setRecurringDays]);

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
    setFormErrors(prev => ({ ...prev, address: undefined }));
    debouncedSearchAddress(value);
  };

  const handleAddressSelect = (feature: AddressFeature) => {
    const { postcode, city, housenumber, street } = feature.properties;
    const fullAddress = `${housenumber ? housenumber + " " : ""}${street}`;
    setFormData(prev => ({
      ...prev,
      address: fullAddress,
      city,
      postalCode: postcode,
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Vous devez être connecté pour créer un événement");
      return;
    }

    const dataToValidate: ZodFormData = {
      ...formData,
      categories: selectedCategories,
      isPaid,
      isRecurring,
      recurringDays: isRecurring ? recurringDays : [],
      price: isPaid ? formData.price : undefined,
    };

    const validationResult = createEventSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      setFormErrors(errors);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setFormErrors({});

    try {
      const validatedData = validationResult.data;
      const eventData = {
        ...validatedData,
        startDate: validatedData.startDate!,
        endDate: validatedData.endDate!,
        price: validatedData.isPaid ? parseFloat(validatedData.price!) : 0,
        createdBy: user.id,
        images: [],
        status: "PUBLISHED" as const,
        streetNumber: "",
        street: "",
        recurringEndDate: null,
      };

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
      setFormErrors({});
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <NoAuth />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-6 space-y-6"
      noValidate
    >
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center">
          <AlertCircle className="mr-2 h-5 w-5" />
          {error}
        </div>
      )}

      <EventDetailsForm
        titleValue={formData.title}
        onTitleChange={e => {
          setFormData({ ...formData, title: e.target.value });
          setFormErrors(prev => ({ ...prev, title: undefined }));
        }}
        titleError={formErrors.title?.[0]}
        descriptionValue={formData.description}
        onDescriptionChange={e => {
          setFormData({ ...formData, description: e.target.value });
          setFormErrors(prev => ({ ...prev, description: undefined }));
        }}
        descriptionError={formErrors.description?.[0]}
        allCategories={categories}
        selectedCategories={selectedCategories}
        onSelectedCategoriesChange={setSelectedCategories}
        categoriesError={formErrors.categories?.[0]}
        onClearCategoriesError={() =>
          setFormErrors(prev => ({ ...prev, categories: undefined }))
        }
      />

      <EventSchedulingForm
        isRecurring={isRecurring}
        setIsRecurring={setIsRecurring}
        recurringDays={recurringDays}
        setRecurringDays={setRecurringDays}
        weekDays={weekDays}
        startDate={formData.startDate}
        setStartDate={newStartDate =>
          setFormData(prev => ({ ...prev, startDate: newStartDate }))
        }
        endDate={formData.endDate}
        setEndDate={newEndDate =>
          setFormData(prev => ({ ...prev, endDate: newEndDate }))
        }
        startTime={formData.startTime}
        setStartTime={newStartTime =>
          setFormData(prev => ({ ...prev, startTime: newStartTime }))
        }
        endTime={formData.endTime}
        setEndTime={newEndTime =>
          setFormData(prev => ({ ...prev, endTime: newEndTime }))
        }
        formErrors={formErrors}
        clearDateErrors={() => {
          setFormErrors(prev => ({
            ...prev,
            startDate: undefined,
            endDate: undefined,
          }));
        }}
        clearTimeErrors={() => {
          setFormErrors(prev => ({
            ...prev,
            startTime: undefined,
            endTime: undefined,
          }));
        }}
      />

      <EventLocationForm
        address={formData.address}
        handleAddressChange={handleAddressChange}
        addressInputRef={addressInputRef}
        showSuggestions={showSuggestions}
        addressSuggestions={addressSuggestions}
        handleAddressSelect={handleAddressSelect}
        city={formData.city}
        setCity={newCity => setFormData(prev => ({ ...prev, city: newCity }))}
        postalCode={formData.postalCode}
        setPostalCode={newPostalCode =>
          setFormData(prev => ({ ...prev, postalCode: newPostalCode }))
        }
        isAccessible={formData.isAccessible}
        setIsAccessible={newIsAccessible =>
          setFormData(prev => ({ ...prev, isAccessible: newIsAccessible }))
        }
        hasParking={formData.hasParking}
        setHasParking={newHasParking =>
          setFormData(prev => ({ ...prev, hasParking: newHasParking }))
        }
        hasPublicTransport={formData.hasPublicTransport}
        setHasPublicTransport={newHasPublicTransport =>
          setFormData(prev => ({
            ...prev,
            hasPublicTransport: newHasPublicTransport,
          }))
        }
        formErrors={formErrors}
        clearCityError={() =>
          setFormErrors(prev => ({ ...prev, city: undefined }))
        }
        clearPostalCodeError={() =>
          setFormErrors(prev => ({ ...prev, postalCode: undefined }))
        }
      />

      <EventImageUpload
        images={images}
        handleImageChange={handleImageChange}
        handleDrop={handleDrop}
        handleDragOver={handleDragOver}
        removeImage={index =>
          setImages(currentImages =>
            currentImages.filter((_, i) => i !== index)
          )
        }
      />

      <EventFinancialsAndContactForm
        isPaid={isPaid}
        setIsPaid={setIsPaid}
        price={formData.price}
        setPrice={newPrice =>
          setFormData(prev => ({ ...prev, price: newPrice }))
        }
        clearPriceError={() =>
          setFormErrors(prev => ({ ...prev, price: undefined }))
        }
        organizerWebsite={formData.organizerWebsite}
        setOrganizerWebsite={newWebsite =>
          setFormData(prev => ({ ...prev, organizerWebsite: newWebsite }))
        }
        organizerPhone={formData.organizerPhone}
        setOrganizerPhone={newPhone =>
          setFormData(prev => ({ ...prev, organizerPhone: newPhone }))
        }
        clearWebsiteError={() =>
          setFormErrors(prev => ({ ...prev, organizerWebsite: undefined }))
        }
        clearPhoneError={() =>
          setFormErrors(prev => ({ ...prev, organizerPhone: undefined }))
        }
        formErrors={formErrors}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        {loading ? "Création en cours..." : "Créer l'événement"}
      </button>
    </form>
  );
}
