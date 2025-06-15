"use client";

import React from "react";
import { MapPin, Accessibility } from "lucide-react";
import FieldErrorDisplay from "./FieldError";
import AddressFeature from "@/lib/types";

interface EventLocationFormProps {
  // Address props
  place: string;
  setPlace: (place: string) => void;
  address: string;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addressInputRef: React.RefObject<HTMLInputElement>;
  showSuggestions: boolean;
  addressSuggestions: AddressFeature[];
  handleAddressSelect: (feature: AddressFeature) => void;
  city: string;
  setCity: (city: string) => void;
  postalCode: string;
  setPostalCode: (postalCode: string) => void;

  // Accessibility props
  isAccessible: boolean;
  setIsAccessible: (isAccessible: boolean) => void;
  hasParking: boolean;
  setHasParking: (hasParking: boolean) => void;
  hasPublicTransport: boolean;
  setHasPublicTransport: (hasPublicTransport: boolean) => void;

  // Error props
  formErrors: {
    place?: string[];
    address?: string[];
    city?: string[];
    postalCode?: string[];
    // Accessibility fields are not typically validated with direct error messages in this setup
  };
  clearCityError: () => void;
  clearPostalCodeError: () => void;
  // No specific error clearing for accessibility checkboxes needed here as they don\'t have direct Zod errors
}

const EventLocationForm: React.FC<EventLocationFormProps> = ({
  place,
  setPlace,
  address,
  handleAddressChange,
  addressInputRef,
  showSuggestions,
  addressSuggestions,
  handleAddressSelect,
  city,
  setCity,
  postalCode,
  setPostalCode,
  isAccessible,
  setIsAccessible,
  hasParking,
  setHasParking,
  hasPublicTransport,
  setHasPublicTransport,
  formErrors,
  clearCityError,
  clearPostalCodeError,
}) => {
  return (
    <>
      {/* Address Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          <MapPin className="inline-block w-4 h-4 mr-2" />
          Adresse de l&apos;événement *
        </label>
        <input
          id="place"
          name="place"
          type="text"
          value={place}
          onChange={e => setPlace(e.target.value)}
          className={`w-full rounded-lg border ${
            formErrors.place ? "border-red-500" : "border-gray-300"
          } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
          placeholder="Lieu de l'événement"
          required
          aria-invalid={!!formErrors.place}
          aria-describedby={formErrors.place ? "place-error" : undefined}
        />
        <div className="relative">
          <input
            id="address"
            name="address"
            type="text"
            ref={addressInputRef}
            value={address}
            onChange={handleAddressChange}
            className={`w-full rounded-lg border ${
              formErrors.address ? "border-red-500" : "border-gray-300"
            } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
            placeholder="Numéro et nom de la rue"
            autoComplete="off"
            aria-invalid={!!formErrors.address}
            aria-describedby={formErrors.address ? "address-error" : undefined}
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
        <div id="address-error">
          <FieldErrorDisplay error={formErrors.address?.[0]} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              id="city"
              name="city"
              type="text"
              value={city}
              onChange={e => {
                setCity(e.target.value);
                clearCityError();
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
              <FieldErrorDisplay error={formErrors.city?.[0]} />
            </div>
          </div>
          <div>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              value={postalCode}
              onChange={e => {
                setPostalCode(e.target.value);
                clearPostalCodeError();
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
              <FieldErrorDisplay error={formErrors.postalCode?.[0]} />
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
          <Accessibility className="inline-block w-4 h-4 mr-2" />
          Accessibilité
        </label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAccessible}
              onChange={e => setIsAccessible(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-600">
              Accessible aux personnes à mobilité réduite
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasParking}
              onChange={e => setHasParking(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-600">
              Parking disponible
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasPublicTransport}
              onChange={e => setHasPublicTransport(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-600">
              Transport en commun à proximité
            </span>
          </label>
        </div>
      </div>
    </>
  );
};

export default EventLocationForm;
