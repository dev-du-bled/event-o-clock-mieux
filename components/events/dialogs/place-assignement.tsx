import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Price } from "@/schemas/createEvent";
import { mapType } from "@/types/types";
import { DialogContent, DialogTitle, DialogTrigger } from "../../ui/dialog";
import Image from "next/image";
import { useState } from "react";

interface PlaceAssignmentProps {
  prices: Price[];
  map: mapType;
  setMap: (map: mapType) => void;
}

export default function PlaceAssignment({
  prices,
  map,
  setMap,
}: PlaceAssignmentProps) {
  const isDisabled = prices.length === 0 || (!map.svg && !map.image);
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [assignedPlaces, setAssignedPlaces] = useState<string>(
    map.svg?.data || ""
  );

  // click on svg
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPrice) return;
    const target = e.target as HTMLElement;
    if (target && target.tagName !== "svg" && target.closest("svg")) {
      target.setAttribute("x-place", selectedPrice.type);
      target.setAttribute("fill", "#FFD700");

      const updatedSvg = (target.closest("svg") as SVGSVGElement).outerHTML;
      setAssignedPlaces(updatedSvg);
    }
  };

  const handleReset = () => {
    if (map.svg?.data) {
      setAssignedPlaces(map.svg.data);
      setSelectedPrice(null);
    }
  };

  const handleSave = () => {
    if (assignedPlaces) {
      setMap({
        ...map,
        svg: { name: map.svg?.name ?? "", data: assignedPlaces },
      });
      setSelectedPrice(null);
    }
  };

  if (isDisabled) return <Button disabled>Affecter les places</Button>;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={isDisabled}>Affecter les places</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Affectation des places</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Affecter les places aux différents tarifs en cliquant sur la carte.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex items-center justify-center rounded-sm relative w-full h-125">
            {map.image?.data && (
              <Image
                src={map.image.data}
                alt="Event Map"
                fill
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
            {assignedPlaces && (
              <div
                dangerouslySetInnerHTML={{ __html: assignedPlaces }}
                className="absolute inset-0 w-full h-full cursor-pointer"
                onClick={handleMapClick}
              />
            )}
          </div>
          <div className="flex gap-2 mb-4">
            {prices.map(price => (
              <Button
                key={price.type}
                variant={
                  selectedPrice?.type === price.type ? "default" : "outline"
                }
                onClick={() => setSelectedPrice(price)}
              >
                {price.type}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button disabled={!selectedPrice} onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
