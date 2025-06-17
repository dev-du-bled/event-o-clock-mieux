"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { createRoomAction } from "@/server/actions/rooms";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRoomDialog() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("Nouvelle salle");
  const [roomCapacity, setRoomCapacity] = useState<number>(50);
  const [roomCurrentMovie, setRoomCurrentMovie] = useState<string>("{}");

  const handleCreateRoom = async () => {
    setLoading(true);

    try {
      const result = await createRoomAction(
        roomName,
        roomCapacity,
        roomCurrentMovie
      );

      if (result.success) {
        toast("Succès", {
          description: `La salle "${roomName}" a été ajoutée avec succès.`,
        });

        setOpen(false);
        router.refresh();
      } else {
        toast("Erreur", {
          description:
            result.message || `Impossible de créer la salle "${roomName}".`,
          closeButton: true,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast("Erreur", {
        description: `Erreur lors de la création de la salle "${roomName}".`,
        closeButton: true,
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Plus className={`w-4 h-4 mr-2 }`} />
          {"Ajouter une salle"}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Créer une nouvelle salle`}</DialogTitle>
        </DialogHeader>

        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nom de la salle:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Nouvelle salle"
          className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        ></input>

        <label
          htmlFor="capacity"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Capacitée:
        </label>
        <input
          type="number"
          id="capacity"
          name="capacity"
          required
          placeholder="50"
          min={1}
          max={520} // Nombre maximum de sièges possible pour 20 sièges par ligne
          className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
          value={roomCapacity}
          onChange={e => setRoomCapacity(parseInt(e.target.value))}
        ></input>

        <DialogFooter>
          <Button onClick={handleCreateRoom} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {`Créer la salle ${roomName}`}
          </Button>
          <DialogClose>
            <Button variant={"secondary"}>{`Annuler`}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
