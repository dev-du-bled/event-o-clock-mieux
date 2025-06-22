"use client";

import React, { useState, useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { EventDataType } from "@/lib/db/events";
import {
  createEventAction,
  updateEventAction,
  redirectAfterSuccess,
} from "@/server/actions/events";
import { authClient } from "@/lib/auth/auth-client";
import { z } from "zod";
import {
  createEventSchema,
  Price,
  weekDaysData,
  CreateEventFormData as ZodFormData,
} from "@/schemas/createEvent";
import EventDetailsForm from "./fields/EventDetailsForm";
import EventSchedulingForm from "./fields/EventSchedulingForm";
import EventLocationForm from "./fields/EventLocationForm";
import EventImageUpload from "./fields/EventImageUpload";
import EventFinancialsAndContactForm from "./fields/EventFinancialsAndContactForm";
import { Base64ToFile, FileToBase64, searchAddress } from "@/lib/utils";
import { AddressData } from "@/types/types";
import { Button } from "@/components/ui/button";

// Helper type pour les erreurs Zod formatées
type FieldErrors = z.inferFlattenedErrors<
  typeof createEventSchema
>["fieldErrors"];

interface EventFormProps {
  type: "create" | "update";
  eventId?: string;
  eventData: EventDataType;
}

export default function EventForm({
  type,
  eventId,
  eventData,
}: EventFormProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Pour les erreurs générales/API
  const [formErrors, setFormErrors] = useState<FieldErrors>({}); // Pour les erreurs Zod
  const [images, setImages] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    eventData.categories
  );
  const [isPaid, setIsPaid] = useState(eventData.isPaid);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressData[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [isRecurring, setIsRecurring] = useState(eventData.isRecurring);
  const [recurringDays, setRecurringDays] = useState<
    ZodFormData["recurringDays"]
  >(eventData.recurringDays as ZodFormData["recurringDays"]);

  const [formData, setFormData] = useState(eventData);

  useEffect(() => {
    if (eventData.images.length > 0) {
      const loadImages = async () => {
        const imagesFile = await Promise.all(
          eventData.images.map(async (img, i) => {
            return await Base64ToFile(img, `image-${i}`);
          })
        );
        setImages(imagesFile);
      };
      loadImages();
    }
  }, [eventData.images]);

  useEffect(() => {
    if (!isPaid) {
      setFormData(prev => ({ ...prev, price: 0 }));
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.prices;
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
  }[] = weekDaysData;

  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, place: value }));
    setFormErrors(prev => ({ ...prev, place: undefined }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value }));
    setFormErrors(prev => ({ ...prev, address: undefined }));
    searchAddress(value, setAddressSuggestions, setShowSuggestions);
  };

  const handleAddressSelect = (feature: AddressData) => {
    const { properties } = feature;
    setFormData(prev => ({
      ...prev,
      address: properties.name,
      city: properties.city,
      postalCode: properties.postcode,
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
      prices: isPaid ? (formData.prices as Price[]) : [],
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

      // Convertir les images en base64
      const base64Images = await Promise.all(
        images.map(image => FileToBase64(image))
      );

      if (type === "create") {
        const result = await createEventAction(validatedData, base64Images);

        if (!result.success) {
          if (result.errors) {
            setFormErrors(result.errors);
          }
          setError(result.message || "Erreur lors de la création");
          return;
        }

        await redirectAfterSuccess("/my-events");
      } else if (eventId) {
        const result = await updateEventAction(
          eventId,
          validatedData,
          base64Images
        );

        if (!result.success) {
          if (result.errors) {
            setFormErrors(result.errors);
          }
          setError(result.message || "Erreur lors de la mise à jour");
          return;
        }

        await redirectAfterSuccess("/my-events");
      }
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-lg shadow-lg p-6 space-y-6"
      noValidate
    >
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center">
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
        place={formData.place}
        handlePlaceChange={handlePlaceChange}
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
        prices={formData.prices as Price[]}
        setPrices={newPrice =>
          setFormData(prev => ({ ...prev, prices: newPrice }))
        }
        clearPricesError={() =>
          setFormErrors(prev => ({ ...prev, prices: undefined }))
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

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? `${type === "create" ? "Création" : "Mise à jour"} en cours...`
          : `${type === "create" ? "Créer" : "Mettre à jour"} l'événement`}
      </Button>
    </form>
  );
}
