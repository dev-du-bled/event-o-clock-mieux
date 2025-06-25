import { Button } from "@/components/ui/button";
import { mapType } from "@/types/types";
import { Map, X } from "lucide-react";
import { useState } from "react";

interface EventFormPlanProps {
  map: mapType;
  setMap: (map: mapType) => void;
}

export default function EventMapForm({ map, setMap }: EventFormPlanProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleMapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = e => {
        const svgString = e.target?.result as string;
        setMap({
          name: file.name,
          data: svgString,
        });
      };
      reader.readAsText(file);
    }
  };

  const deleteMap = () => {
    setMap({
      name: undefined,
      data: undefined,
    });
  };

  return (
    <>
      {/* Modal to select where are places on map */}
      {/* <PlaceAssignment
        open={open}
        setOpen={setOpen}
        prices={formData.prices as Price[]}
        map={formData.map as mapType}
        setMap={(map: mapType) => setFormData({ ...formData, map })}
      /> */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mb-2">
          <Map className="w-4 h-4" />
          <span>Plan</span>
        </label>
        <div className="relative" onDragOver={e => e.preventDefault()}>
          <input
            type="file"
            accept=".svg"
            onChange={handleMapChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            placeholder="Upload a map (SVG format)"
          />
          <div className="flex flex-col sm:flex-row gap-2 text-secondary-foreground px-3 py-2 rounded-md border">
            <Button className="flex-shrink-0">
              <span className="text-sm">Parcourir...</span>
            </Button>
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm truncate">
                {(map && map.name) || "Pas de fichier sélectionné"}
              </span>
              {map && map.data && (
                <button
                  type="button"
                  onClick={deleteMap}
                  className="absolute right-3 bg-red-600 text-accent rounded-full w-5 h-5 flex items-center justify-center hover:cursor-pointer"
                  aria-label={`Supprimer le plan`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
