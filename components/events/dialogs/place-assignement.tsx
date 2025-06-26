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
import { useEffect, useState } from "react";

interface PlaceAssignmentProps {
  prices: Price[];
  map: mapType;
  setMap: (map: mapType) => void;
}

interface PriceColorAssignment {
  price: Price;
  color: string;
}

export default function PlaceAssignment({
  prices,
  map,
  setMap,
}: PlaceAssignmentProps) {
  const isDisabled = prices.length === 0 || !map.svg;

  const [open, setOpen] = useState<boolean>(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string>("");
  const [priceColorAssignments, setPriceColorAssignments] = useState<
    PriceColorAssignment[]
  >([]);
  const [assignedPlaces, setAssignedPlaces] = useState<string>(
    map.svg?.data || ""
  );

  // to update prices when props change
  useEffect(() => {
    const colors = generateDistinctColors(prices.length);
    setPriceColorAssignments(prevAssignments => {
      return prices.map((price, idx) => {
        const prev = prevAssignments.find(
          a => a.price.type === price.type && a.price.price === price.price
        );
        return {
          price,
          color: prev ? prev.color : colors[idx] || "#000000",
        };
      });
    });
    if (
      selectedPriceId &&
      !prices.some(p => `${p.type}-${p.price}` === selectedPriceId)
    ) {
      setSelectedPriceId("");
    }
  }, [prices, selectedPriceId]);

  // colors for events (10 cause max is 10 prices)
  const generateDistinctColors = (count: number): string[] => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];
    return colors.slice(0, count);
  };

  const initializePriceColors = () => {
    if (priceColorAssignments.length === 0 && prices.length > 0) {
      const colors = generateDistinctColors(prices.length);
      const assignments = prices.map((price, index) => ({
        price,
        color: colors[index],
      }));
      setPriceColorAssignments(assignments);
    }
  };

  const getColorForPrice = (priceId: string): string => {
    const assignment = priceColorAssignments.find(
      a => `${a.price.type}-${a.price.price}` === priceId
    );
    return assignment?.color || "#000000";
  };

  const getSelectedPrice = (): Price | null => {
    const assignment = priceColorAssignments.find(
      a => `${a.price.type}-${a.price.price}` === selectedPriceId
    );
    return assignment?.price || null;
  };

  // Click svg
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const selectedPrice = getSelectedPrice();
    if (!selectedPrice) return;

    const target = e.target as HTMLElement;
    if (target && target.tagName !== "svg" && target.closest("svg")) {
      const color = getColorForPrice(selectedPriceId);

      target.setAttribute("x-eoc-price", selectedPrice.price.toString());
      target.setAttribute("x-eoc-price-type", selectedPrice.type);
      target.setAttribute("fill", color);

      const updatedSvg = (target.closest("svg") as SVGSVGElement).outerHTML;
      setAssignedPlaces(updatedSvg);
    }
  };

  const handleReset = () => {
    if (assignedPlaces) {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(assignedPlaces, "image/svg+xml");

      const shapes = svgDoc.querySelectorAll(
        "polygon, path, rect, circle, ellipse"
      );

      shapes.forEach(element => {
        element.setAttribute("fill", "#000000");
        element.removeAttribute("x-eoc-price");
        element.removeAttribute("x-eoc-price-type");
      });

      const updatedSvg = svgDoc.documentElement.outerHTML;
      setAssignedPlaces(updatedSvg);
    }
  };

  const handleSave = () => {
    if (assignedPlaces) {
      setMap({
        ...map,
        svg: { name: map.svg?.name ?? "", data: assignedPlaces },
      });
    }
    setOpen(false);
  };

  const handleColorChange = (priceId: string, newColor: string) => {
    const oldColor = getColorForPrice(priceId);

    setPriceColorAssignments(prev =>
      prev.map(assignment =>
        `${assignment.price.type}-${assignment.price.price}` === priceId
          ? { ...assignment, color: newColor }
          : assignment
      )
    );

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(assignedPlaces, "image/svg+xml");
    const shapes = svgDoc.querySelectorAll(
      "polygon, path, rect, circle, ellipse"
    );

    shapes.forEach(shape => {
      if (shape.getAttribute("fill") === oldColor) {
        const assignment = priceColorAssignments.find(
          a => a.color === oldColor
        );
        if (
          assignment &&
          shape.getAttribute("x-eoc-price") ===
            assignment.price.price.toString() &&
          shape.getAttribute("x-eoc-price-type") === assignment.price.type
        ) {
          shape.setAttribute("fill", newColor);
        }
      }
    });

    const updatedSvg = svgDoc.documentElement.outerHTML;
    setAssignedPlaces(updatedSvg);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      initializePriceColors();
    }
  };

  if (isDisabled) return <Button disabled>Affecter les places</Button>;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isDisabled}>Affecter les places</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Affectation des places</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Sélectionnez un type de place et cliquez sur les zones du plan pour
            les assigner.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedPriceId && (
            <div className="bg-muted border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: getColorForPrice(selectedPriceId) }}
                />
                <span className="text-sm font-medium text-primary">
                  Assignation: {getSelectedPrice()?.type} (
                  {getSelectedPrice()?.price} €)
                </span>
              </div>
            </div>
          )}

          {/* Map */}
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
              {assignedPlaces && (
                <div
                  dangerouslySetInnerHTML={{ __html: assignedPlaces }}
                  className="absolute inset-0 cursor-pointer"
                  onClick={handleMapClick}
                />
              )}
            </div>
          </div>
          {/* Price Types */}
          <div className="border rounded-lg p-4 bg-muted">
            <h3 className="text-sm font-semibold mb-3">Types de places</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {priceColorAssignments.map(assignment => {
                const priceId = `${assignment.price.type}-${assignment.price.price}`;
                return (
                  <div
                    key={priceId}
                    className="flex items-center gap-3 p-2 bg-background rounded-md border"
                  >
                    <input
                      type="color"
                      value={assignment.color}
                      onChange={e => handleColorChange(priceId, e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 truncate">
                      <div className="font-medium text-sm">
                        {assignment.price.type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {assignment.price.price} €
                      </div>
                    </div>
                    <Button
                      variant={
                        selectedPriceId === priceId ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedPriceId(
                          selectedPriceId === priceId ? "" : priceId
                        )
                      }
                    >
                      {selectedPriceId === priceId
                        ? "Sélectionné"
                        : "Sélectionner"}
                    </Button>
                  </div>
                );
              })}
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
