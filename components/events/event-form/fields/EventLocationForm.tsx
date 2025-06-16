"use client";

import React from "react";
import { MapPin, Accessibility } from "lucide-react";
import FieldErrorDisplay from "./FieldError";
import { AddressFeature } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface EventLocationFormProps {
  // Address props
  place: string;
  handlePlaceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  handlePlaceChange,
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
        <label className="block text-sm font-medium text-foreground">
          <MapPin className="inline-block w-4 h-4 mr-2" />
          Adresse de l&apos;événement *
        </label>
        <Input
          id="place"
          name="place"
          type="text"
          value={place}
          onChange={handlePlaceChange}
          className={formErrors.place && "border-destructive"}
          placeholder="Lieu de l'événement"
          required
          aria-invalid={!!formErrors.place}
          aria-describedby={formErrors.place ? "place-error" : undefined}
        />
        <div id="place-error">
          <FieldErrorDisplay error={formErrors.place?.[0]} />
        </div>
        <div className="relative">
          <Input
            id="address"
            name="address"
            type="text"
            ref={addressInputRef}
            value={address}
            onChange={handleAddressChange}
            className={formErrors.address && "border-destructive"}
            placeholder="Numéro et nom de la rue"
            autoComplete="off"
            aria-invalid={!!formErrors.address}
            aria-describedby={formErrors.address ? "address-error" : undefined}
          />
          {showSuggestions && addressSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {addressSuggestions.map((feature, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-accent focus:outline-none focus:bg-accent text-foreground"
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
            <Input
              id="city"
              name="city"
              type="text"
              value={city}
              onChange={e => {
                setCity(e.target.value);
                clearCityError();
              }}
              className={`w-full rounded-lg border ${
                formErrors.city ? "border-destructive" : "border-Input"
              } bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary`}
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
            <Input
              id="postalCode"
              name="postalCode"
              type="text"
              value={postalCode}
              onChange={e => {
                setPostalCode(e.target.value);
                clearPostalCodeError();
              }}
              className={`w-full rounded-lg border ${
                formErrors.postalCode ? "border-destructive" : "border-Input"
              } bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary`}
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
        <label className="block text-sm font-medium text-foreground mb-2 mt-4">
          <Accessibility className="inline-block w-4 h-4 mr-2" />
          Accessibilité
        </label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <Checkbox
              checked={isAccessible}
              onCheckedChange={e => setIsAccessible(e as boolean)}
            />
            <span className="ml-2 text-sm text-muted-foreground">
              Accessible aux personnes à mobilité réduite
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <Checkbox
              checked={hasParking}
              onCheckedChange={e => setHasParking(e as boolean)}
            />
            <span className="ml-2 text-sm text-muted-foreground">
              Parking disponible
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <Checkbox
              checked={hasPublicTransport}
              onCheckedChange={e => setHasPublicTransport(e as boolean)}
            />
            <span className="ml-2 text-sm text-muted-foreground">
              Transport en commun à proximité
            </span>
          </label>
        </div>
      </div>
    </>
  );
};

export default EventLocationForm;
