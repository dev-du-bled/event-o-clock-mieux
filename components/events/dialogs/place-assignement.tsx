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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [open, setOpen] = useState<boolean>(false);
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [color, setColor] = useState<string>("#444444");
  const [assignedPlaces, setAssignedPlaces] = useState<string>(
    map.svg?.data || ""
  );

  // click on svg
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPrice) return;
    const target = e.target as HTMLElement;
    if (target && target.tagName !== "svg" && target.closest("svg")) {
      target.setAttribute("x-eoc-price", selectedPrice.price.toString());
      target.setAttribute("fill", color);
      console.log(target);

      const updatedSvg = (target.closest("svg") as SVGSVGElement).outerHTML;
      setAssignedPlaces(updatedSvg);
    }
  };

  const handleReset = () => {
    if (assignedPlaces) {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(assignedPlaces, "image/svg+xml");
      const polygons = svgDoc.querySelectorAll("polygon");

      polygons.forEach(polygon => {
        polygon.setAttribute("fill", "#000000");
        polygon.removeAttribute("x-eoc-price");
      });

      const updatedSvg = svgDoc.documentElement.outerHTML;
      setAssignedPlaces(updatedSvg);
      setSelectedPrice(null);
    }
    setOpen(false);
  };

  const handleSave = () => {
    if (assignedPlaces) {
      setMap({
        ...map,
        svg: { name: map.svg?.name ?? "", data: assignedPlaces },
      });
      setSelectedPrice(null);
    }
    setOpen(false);
  };

  const handlePriceChange = (price: string) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(assignedPlaces, "image/svg+xml");
    const polygons = svgDoc.querySelectorAll("polygon");

    polygons.forEach(polygon => {
      if (polygon.getAttribute("fill") === color) {
        polygon.setAttribute("x-eoc-price", price);
      }
    });

    const updatedSvg = svgDoc.documentElement.outerHTML;
    setAssignedPlaces(updatedSvg);
    setSelectedPrice(prices.find(p => p.price.toString() === price) || null);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const oldColor = color;
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(assignedPlaces, "image/svg+xml");
    const polygons = svgDoc.querySelectorAll("polygon");

    polygons.forEach(polygon => {
      if (polygon.getAttribute("fill") === oldColor) {
        polygon.setAttribute("fill", e.target.value);
      }
    });

    const updatedSvg = svgDoc.documentElement.outerHTML;
    setAssignedPlaces(updatedSvg);
    setColor(e.target.value);
  };

  // const setColorPrice = (
  //   price: PricesColors,
  //   color: string,
  //   newColor: string
  // ) => {
  //   const parser = new DOMParser();
  //   const svgDoc = parser.parseFromString(assignedPlaces, "image/svg+xml");
  //   const polygons = svgDoc.querySelectorAll("polygon");
  //   polygons.forEach(polygon => {
  //     if (
  //       polygon.getAttribute("fill") === color &&
  //       polygon.getAttribute("x-eoc-price") === price.price.toString()
  //     ) {
  //       polygon.setAttribute("fill", newColor);
  //     }
  //   });
  //   setAssignedPlaces(svgDoc.documentElement.outerHTML);

  // };

  if (isDisabled) return <Button disabled>Affecter les places</Button>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <div className="flex flex-col items-start gap-2 mb-4">
            {/* Svg & image */}
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
                  className="absolute inset-0 cursor-pointer"
                  onClick={handleMapClick}
                />
              )}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="color"
                value={color}
                onChange={handleColorChange}
                className="w-10 h-10 border rounded cursor-pointer"
              />
              <Select
                defaultValue="aaa"
                value={selectedPrice?.price?.toString() || ""}
                onValueChange={handlePriceChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Places" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {prices.map(price => (
                      <SelectItem
                        key={`${price.type}-${price.price}`}
                        value={price.price.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{price.type}</span>
                          <span className="text-sm text-muted-foreground">
                            {price.price} €
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
