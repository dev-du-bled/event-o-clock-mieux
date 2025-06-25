"use client";

import React from "react";
import { Wallet, X } from "lucide-react";
import FieldErrorDisplay from "./FieldError";
import { Button } from "@/components/ui/button";
import { Price, priceSchema } from "@/schemas/createEvent";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EventFinancialsAndContactFormProps {
  // Price props
  isPaid: boolean;
  setIsPaid: (isPaid: boolean) => void;
  prices: Price[];
  setPrices: (prices: Price[]) => void;
  clearPricesError: () => void;

  // Error props
  formErrors: {
    prices?: string[];
  };
}

const EventFinancialForm: React.FC<EventFinancialsAndContactFormProps> = ({
  isPaid,
  setIsPaid,
  prices,
  setPrices,
  clearPricesError,
  formErrors,
}) => {
  const [type, setType] = React.useState<string>("");
  const [count, setCount] = React.useState<number>(1);
  const [price, setPrice] = React.useState<number>(1);
  const [errors, setErrors] = React.useState<{
    type?: string;
    count?: string;
    price?: string;
  }>({});

  const validate = () => {
    setErrors({});

    const result = priceSchema.safeParse({
      type,
      count,
      price,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setErrors({
        type: errors.type?.[0],
        count: errors.count?.[0],
        price: errors.price?.[0],
      });
      clearPricesError();
      return;
    }

    const data = result.data;
    setPrices([...prices, data]);
    setType("");
    setPrice(1);
    clearPricesError();
  };

  return (
    <div className="space-y-4">
      {/* Price Section */}
      <label className="flex items-center gap-2 mb-2">
        <Wallet className="w-4 h-4" />
        Tarifs *
      </label>
      <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
        <RadioGroup
          defaultValue={isPaid ? "Payant" : "Gratuit"}
          className="flex"
          onValueChange={e => setIsPaid(e === "Payant")}
        >
          <label className="text-sm flex items-center gap-2">
            <RadioGroupItem value="Gratuit" />
            Gratuit
          </label>
          <label className="text-sm flex items-center gap-2">
            <RadioGroupItem value="Payant" />
            Payant
          </label>
        </RadioGroup>
        {isPaid && (
          <div className="flex sm:justify-end">
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
            <div>
              <Input
                id="type"
                name="type"
                type="text"
                value={type}
                onChange={e => {
                  setType(e.target.value);
                  setErrors(prev => ({ ...prev, type: undefined }));
                }}
                className={
                  (errors.type || formErrors.prices?.[0]) &&
                  "border-destructive"
                }
                placeholder="Type de la place (ex: catégorie 1, VIP, etc.)"
                aria-invalid={!!errors.type}
                aria-describedby={errors.type ? "type-error" : undefined}
              />
              <FieldErrorDisplay error={errors.type} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={price.toString()}
                  onChange={e => {
                    setPrice(parseFloat(e.target.value));
                    setErrors(prev => ({ ...prev, price: undefined }));
                  }}
                  className={
                    (errors.price || formErrors.prices?.[0]) &&
                    "border-destructive"
                  }
                  placeholder="Prix en euros"
                  step="0.01"
                  min="0"
                  aria-invalid={!!errors.price}
                  aria-describedby={errors.price ? "price-error" : undefined}
                />
                <FieldErrorDisplay error={errors.price} />
              </div>
              <div className="flex-1">
                <Input
                  id="count"
                  name="count"
                  type="number"
                  value={count.toString()}
                  onChange={e => {
                    setCount(parseInt(e.target.value));
                    setErrors(prev => ({ ...prev, count: undefined }));
                  }}
                  className={
                    (errors.count || formErrors.prices?.[0]) &&
                    "border-destructive"
                  }
                  placeholder="Nombre de places disponibles"
                  min="1"
                  aria-invalid={!!errors.count}
                  aria-describedby={errors.count ? "count-error" : undefined}
                />
                <FieldErrorDisplay error={errors.count} />
              </div>
            </div>
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
          <h3 className="text-sm font-medium mb-2">Tarifs Configurés</h3>
          <div className="flex gap-2 flex-wrap">
            {prices.map((priceItem, index) => (
              <div
                key={index}
                className="flex text-sm bg-accent-foreground rounded-2xl text-accent gap-2 pl-2 py-1 pr-1"
              >
                {priceItem.type} - {priceItem.price}€ ({priceItem.count} places)
                <button
                  type="button"
                  className="w-5 h-5 flex justify-center items-center rounded-full hover:bg-destructive"
                  onClick={() =>
                    setPrices(prices.filter((_, i) => i !== index))
                  }
                >
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFinancialForm;
