import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Price } from "@/schemas/createEvent";
import { mapType } from "@/types/types";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";

interface PlaceAssignmentProps {
  // for dialog state
  open: boolean;
  setOpen: (open: boolean) => void;

  // data states
  prices: Price[];
  map: mapType;
  setMap: (map: mapType) => void;
}

export default function PlaceAssignment({
  open,
  setOpen,
  prices,
  map,
  //   setMap,
}: PlaceAssignmentProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <></>
      </DialogTrigger>
      <DialogHeader>
        <DialogTitle>Affectation des places</DialogTitle>
      </DialogHeader>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Tarifs</h2>
        {prices.length > 0 ? (
          <ul className="space-y-2">
            {prices.map((price, index) => (
              <li key={index} className="flex justify-between">
                <span>{price.type}</span>
                <span>{price.price} €</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aucun tarif défini.</p>
        )}

        <h2 className="text-lg font-semibold mt-6 mb-4">Plan de salle</h2>
        {map.name ? (
          <div className="border p-4 rounded-md">
            <p>Plan: {map.name}</p>
            {/* Add more details about the map if needed */}
          </div>
        ) : (
          <p className="text-gray-500">Aucun plan de salle sélectionné.</p>
        )}
      </div>
    </Dialog>
  );
}
