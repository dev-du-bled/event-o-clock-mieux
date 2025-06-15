"use client";

import React from "react";
import { Info, Wallet, X } from "lucide-react";
import FieldErrorDisplay from "./FieldError";
import { Button } from "@/components/ui/button";
import { Price, priceSchema } from "@/schemas/createEvent";

interface EventFinancialsAndContactFormProps {
  // Price props
  isPaid: boolean;
  setIsPaid: (isPaid: boolean) => void;
  prices: { type: string; price: string }[];
  setPrices: (prices: Price[]) => void;
  clearPricesError: () => void;

  // Contact info props
  organizerWebsite: string;
  setOrganizerWebsite: (website: string) => void;
  organizerPhone: string;
  setOrganizerPhone: (phone: string) => void;
  clearWebsiteError: () => void;
  clearPhoneError: () => void;

  // Error props
  formErrors: {
    prices?: string[];
    organizerWebsite?: string[];
    organizerPhone?: string[];
  };
}

const EventFinancialsAndContactForm: React.FC<
  EventFinancialsAndContactFormProps
> = ({
  isPaid,
  setIsPaid,
  prices,
  setPrices,
  clearPricesError,
  organizerWebsite,
  setOrganizerWebsite,
  organizerPhone,
  setOrganizerPhone,
  clearWebsiteError,
  clearPhoneError,
  formErrors,
}) => {
  const [type, setType] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>("");
  const [errors, setErrors] = React.useState<{
    type?: string;
    price?: string;
  }>({});

  const validate = () => {
    setErrors({});

    const result = priceSchema.safeParse({
      type,
      price: price.replace(",", "."),
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setErrors({
        type: errors.type?.[0],
        price: errors.price?.[0],
      });
      clearPricesError();
      return;
    }

    const data = result.data;
    setPrices(
      [...prices, data].sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      )
    ); // sort in asc order to easier display after
    setType("");
    setPrice("0");
    clearPricesError();
  };

  return (
    <>
      {/* Price Section */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <Wallet className="inline-block w-4 h-4 mr-2" />
          Tarifs *
        </label>
        <div className="flex justify-between">
          <div className="space-x-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="paymentType"
                checked={!isPaid}
                onChange={() => {
                  setIsPaid(false);
                  setPrices([]);
                  clearPricesError();
                }}
                className="text-primary"
              />
              <span className="ml-2 text-sm text-gray-600">Gratuit</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="paymentType"
                checked={isPaid}
                onChange={() => setIsPaid(true)}
                className="text-primary"
              />
              <span className="ml-2 text-sm text-gray-600">Payant</span>
            </label>
          </div>
          {isPaid && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={validate}
                type="button"
              >
                Ajouter un tarif
              </Button>
            </div>
          )}
        </div>
        {isPaid && (
          <div className="mt-2 space-y-4">
            <div className="flex flex-col space-y-2">
              <input
                id="type"
                name="type"
                value={type}
                onChange={e => {
                  setType(e.target.value);
                  setErrors(prev => ({ ...prev, type: undefined }));
                }}
                className={`w-full rounded-lg border ${
                  errors.type || formErrors.prices?.[0]
                    ? "border-red-500"
                    : "border-gray-300"
                } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                placeholder="Type de la place (ex: catégorie 1, VIP, etc.)"
                step="0.01"
                min="0"
                aria-invalid={!!errors.type}
                aria-describedby={errors.type ? "type-error" : undefined}
              />
              <FieldErrorDisplay error={errors.type} />
              <input
                id="price"
                name="price"
                value={price}
                onChange={e => {
                  setPrice(e.target.value);
                  setErrors(prev => ({ ...prev, price: undefined }));
                }}
                className={`w-full rounded-lg border ${
                  errors.price || formErrors.prices?.[0]
                    ? "border-red-500"
                    : "border-gray-300"
                } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                placeholder="Prix en euros"
                step="0.01"
                min="0"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "price-error" : undefined}
              />
              <FieldErrorDisplay error={errors.price} />
            </div>
          </div>
        )}
        {formErrors.prices && (
          <div className="mt-2">
            <FieldErrorDisplay error={formErrors.prices[0]} />
          </div>
        )}
        {isPaid && prices.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Tarifs Configurés
            </h3>
            <div className="flex gap-2 flex-wrap">
              {prices.map((priceItem, index) => (
                <div
                  key={index}
                  className="flex text-sm bg-accent-foreground rounded-2xl text-accent gap-2 pl-2 py-1 pr-1"
                >
                  {priceItem.type}: {priceItem.price} €
                  <button
                    type="button"
                    className="w-5 h-5 flex justify-center items-center rounded-full hover:bg-red-500"
                    onClick={() =>
                      setPrices(prices.filter((_, i) => i !== index))
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
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
            <FieldErrorDisplay error={formErrors.organizerWebsite?.[0]} />
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
            <FieldErrorDisplay error={formErrors.organizerPhone?.[0]} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EventFinancialsAndContactForm;
