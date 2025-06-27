"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Price } from "@/schemas/createEvent";
import { addToCartAction } from "@/server/actions/cart";
import { mapType } from "@/types/types";
import { DialogClose } from "@radix-ui/react-dialog";
import { Plus, Ticket, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BookDialogProps {
  eventId: string;
  eventName: string;
  map: mapType;
  prices: Price[];
}

export default function BookDialog({
  eventId,
  eventName,
  map,
  prices,
}: BookDialogProps) {
  const [open, setOpen] = useState(false);
  const [validPrices, setValidPrices] = useState<
    Array<Price & { color?: string }>
  >([]);
  const [selectedPrices, setSelectedPrices] = useState<
    {
      price: Price & { color?: string };
      count: number;
    }[]
  >([]);

  useEffect(() => {
    // parse svg to ensure correct prices wtih db prices
    const initializePlaces = () => {
      if (!map.svg) {
        setValidPrices(prices.map(price => ({ ...price })));
        return;
      }

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(map.svg.data, "image/svg+xml");
      const shapes = svgDoc.querySelectorAll(
        "polygon, path, rect, circle, ellipse"
      );
      const uniquePrices: Array<Price & { color: string }> = [];

      shapes.forEach(shape => {
        const type = shape.getAttribute("x-eoc-price-type");
        const price = shape.getAttribute("x-eoc-price");
        const color = shape.getAttribute("fill");

        if (prices.length > 0 && type && price) {
          const checkPrice = prices.find(
            p => p.type === type && p.price === parseFloat(price)
          );
          if (checkPrice) {
            const exists = uniquePrices.some(
              p => p.type === checkPrice.type && p.price === checkPrice.price
            );
            if (!exists) {
              uniquePrices.push({ ...checkPrice, color: color || "#000000" });
            }
          }
        }
      });

      setValidPrices(uniquePrices);
    };

    initializePlaces();
  }, [map.svg, prices]);

  const handleAddPrice = (price: Price & { color?: string }) => {
    setSelectedPrices(prev => {
      // seek if place type and price already exists
      const idx = prev.findIndex(
        p => p.price.type === price.type && p.price.price === price.price
      );
      // if it exists, increment the count
      if (idx !== -1) {
        const updated = [...prev];
        const totalSelected = updated[idx].count + 1;
        // check if enough places remains
        const totalAvailable = price.count;
        if (totalSelected > totalAvailable) {
          return prev;
        }
        updated[idx] = {
          ...updated[idx],
          count: updated[idx].count + 1,
        };
        return updated;
        //else add a new entry
      } else {
        return [...prev, { price, count: 1 }];
      }
    });
  };

  const handleRemovePrice = (selected: Price) => {
    setSelectedPrices(prev =>
      prev.filter(
        p =>
          !(p.price.type === selected.type && p.price.price === selected.price)
      )
    );
  };

  const handleConfirm = async () => {
    const response = await addToCartAction(
      selectedPrices.map(item => ({
        eventId: eventId,
        eventName: eventName,
        type: item.price.type,
        price: item.price.price * item.count,
        quantity: item.count,
      }))
    );

    if (response.success) {
      setSelectedPrices([]);
      toast.success("Réservation réussie !");
    } else {
      toast.error("Erreur lors de la réservation" + response.message);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Ticket className="h-4 w-4" />
          Réserver
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choix des Places</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Sélectionnez les places à réserver.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Map */}
          {map.svg && (
            <div className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-center relative w-full h-96 bg-muted">
                {map.image?.data && (
                  <Image
                    src={map.image.data}
                    alt="Event Map"
                    fill
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                )}
                {map.svg?.data && (
                  <div
                    dangerouslySetInnerHTML={{ __html: map.svg.data }}
                    className="absolute inset-0"
                  />
                )}
              </div>
            </div>
          )}
          {/* Price Types */}
          <div className="border rounded-lg p-4 bg-muted">
            <h3 className="text-sm font-semibold mb-3">Places</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {validPrices.map(price => {
                return (
                  <div
                    key={`${price.type}-${price.price}`}
                    className="flex items-center gap-3 p-2 bg-background rounded-md border"
                  >
                    <div className="flex-1 flex truncate space-x-2">
                      <div className="flex items-center gap-2">
                        {price.color && (
                          <span
                            className="inline-block w-4 h-4 rounded border"
                            style={{ backgroundColor: price.color }}
                          />
                        )}
                        <div className="font-medium text-sm">{price.type}</div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        {price.price} €
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddPrice(price)}
                      className="flex rounded-sm bg-accent-foreground p-1"
                    >
                      <Plus className="h-4 w-4 text-accent" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Prices */}
          <div className="border rounded-lg p-4 bg-muted">
            <h3 className="text-sm font-semibold mb-3">Sélection</h3>
            {selectedPrices.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                Aucune place sélectionnée.
              </div>
            ) : (
              <ul className="space-y-2">
                {selectedPrices.map(selected => (
                  <li
                    key={`${selected.price.type}-${selected.price.price}`}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {selected.price.color && (
                        <span
                          className="inline-block w-4 h-4 rounded border"
                          style={{ backgroundColor: selected.price.color }}
                        />
                      )}
                      <span className="font-medium text-sm">
                        {selected.price.type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {selected.price.price} €
                      </span>
                      <span className="ml-2">x{selected.count}</span>
                    </div>
                    <button
                      className="bg-accent p-1 rounded-sm"
                      onClick={() => handleRemovePrice(selected.price)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row mt-4">
          <div className="flex items-center w-full">
            <span className="text-sm text-muted-foreground">
              Prix Total :{" "}
              {selectedPrices.reduce(
                (total, item) => total + item.price.price * item.count,
                0
              )}{" "}
              €
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <DialogClose asChild>
              <Button variant="outline" className="mr-2">
                Annuler
              </Button>
            </DialogClose>
            <Button
              disabled={selectedPrices.length === 0}
              onClick={handleConfirm}
            >
              Valider
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
