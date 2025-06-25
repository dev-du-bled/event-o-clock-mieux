import { Button } from "@/components/ui/button";
import { FileToBase64 } from "@/lib/utils";
import { mapType } from "@/types/types";
import { Map, X } from "lucide-react";
import { useRef } from "react";

interface EventFormPlanProps {
  map: mapType;
  setMap: (map: mapType) => void;
}

export default function EventMapForm({ map, setMap }: EventFormPlanProps) {
  const svgRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const handleSvgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = e => {
        const svgString = e.target?.result as string;
        setMap({
          ...map,
          svg: {
            name: file.name,
            data: svgString,
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const imageString = await FileToBase64(file);
      setMap({
        ...map,
        image: {
          name: file.name,
          data: imageString,
        },
      });
    }
  };

  const deleteSvg = () => {
    setMap({
      ...map,
      svg: undefined,
    });
    svgRef.current!.value = "";
  };

  const deleteImage = () => {
    setMap({
      ...map,
      image: undefined,
    });
    imageRef.current!.value = "";
  };

  return (
    <>
      <label className="flex items-center gap-2 mb-2">
        <Map className="w-4 h-4" />
        <span>Plan</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-col flex-1 min-w-55 gap-2">
          <label className="text-sm text-muted-foreground">Plan SVG</label>
          <div className="flex border rounded-md p-2 items-center gap-2">
            <input
              ref={svgRef}
              type="file"
              accept=".svg"
              onChange={handleSvgChange}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => svgRef.current?.click()}
            >
              Parcourir...
            </Button>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-between">
              <span className="text-sm truncate max-w-full">
                {map.svg?.name || "Pas de fichiers sélectionné"}
              </span>
              {map.svg && (
                <button
                  className="flex bg-destructive rounded-full text-accent p-0.5"
                  onClick={deleteSvg}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-55 gap-2">
          <label className="text-sm text-muted-foreground">Plan Image</label>
          <div className="flex flex-1 min-w-55 border rounded-md p-2 items-center gap-2">
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => imageRef.current?.click()}
            >
              Parcourir...
            </Button>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-between">
              <span className="text-sm truncate max-w-full">
                {map.image?.name || "Pas de fichiers sélectionné"}
              </span>
              {map.image && (
                <button
                  className="flex bg-destructive rounded-full text-accent p-0.5"
                  onClick={deleteImage}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
