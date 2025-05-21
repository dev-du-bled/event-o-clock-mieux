"use client";

import React from "react";
import { DollarSign, Info } from "lucide-react";
import FieldErrorDisplay from "./FieldError";

interface EventFinancialsAndContactFormProps {
  // Price props
  isPaid: boolean;
  setIsPaid: (isPaid: boolean) => void;
  price: string;
  setPrice: (price: string) => void;
  clearPriceError: () => void;

  // Contact info props
  organizerWebsite: string;
  setOrganizerWebsite: (website: string) => void;
  organizerPhone: string;
  setOrganizerPhone: (phone: string) => void;
  clearWebsiteError: () => void;
  clearPhoneError: () => void;

  // Error props
  formErrors: {
    price?: string[];
    organizerWebsite?: string[];
    organizerPhone?: string[];
  };
}

const EventFinancialsAndContactForm: React.FC<
  EventFinancialsAndContactFormProps
> = ({
  isPaid,
  setIsPaid,
  price,
  setPrice,
  clearPriceError,
  organizerWebsite,
  setOrganizerWebsite,
  organizerPhone,
  setOrganizerPhone,
  clearWebsiteError,
  clearPhoneError,
  formErrors,
}) => {
  return (
    <>
      {/* Price Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="inline-block w-4 h-4 mr-2" />
          Prix *
        </label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              checked={!isPaid}
              onChange={() => {
                setIsPaid(false);
                setPrice("");
                clearPriceError();
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
              type="number"
              value={price}
              onChange={e => {
                setPrice(e.target.value);
                clearPriceError();
              }}
              className={`w-full rounded-lg border ${
                formErrors.price ? "border-red-500" : "border-gray-300"
              } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
              placeholder="Prix en euros"
              step="0.01"
              min="0"
              aria-invalid={!!formErrors.price}
              aria-describedby={formErrors.price ? "price-error" : undefined}
            />
            <div id="price-error">
              <FieldErrorDisplay error={formErrors.price?.[0]} />
            </div>
          </div>
        )}
        {!isPaid && formErrors.price && (
          <FieldErrorDisplay error={formErrors.price?.[0]} />
        )}
      </div>

      {/* Contact Info Section */}
      <div className="mt-4">
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
              value={organizerWebsite}
              onChange={e => {
                setOrganizerWebsite(e.target.value);
                clearWebsiteError();
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
              <FieldErrorDisplay error={formErrors.organizerWebsite?.[0]} />
            </div>
          </div>
          <div>
            <input
              id="organizerPhone"
              name="organizerPhone"
              type="tel"
              value={organizerPhone}
              onChange={e => {
                setOrganizerPhone(e.target.value);
                clearPhoneError();
              }}
              className={`w-full rounded-lg border ${
                formErrors.organizerPhone ? "border-red-500" : "border-gray-300"
              } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
              placeholder="Numéro de téléphone"
              aria-invalid={!!formErrors.organizerPhone}
              aria-describedby={
                formErrors.organizerPhone ? "organizerPhone-error" : undefined
              }
            />
            <div id="organizerPhone-error">
              <FieldErrorDisplay error={formErrors.organizerPhone?.[0]} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventFinancialsAndContactForm;
