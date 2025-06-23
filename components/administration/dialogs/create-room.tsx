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
import { Input } from "@/components/ui/input";

export default function CreateRoomDialog() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("Nouvelle salle");
  const [roomCapacity, setRoomCapacity] = useState<number>(50);

  const handleCreateRoom = async () => {
    setLoading(true);

    try {
      const result = await createRoomAction(roomName, roomCapacity);

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
      <DialogTrigger asChild>
        <Button>
          <Plus className={`w-4 h-4 mr-2 }`} />
          {"Ajouter une salle"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Créer une nouvelle salle`}</DialogTitle>
        </DialogHeader>

        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nom de la salle:
        </label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          maxLength={25}
          placeholder="Nouvelle salle"
          className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        ></Input>

        <label htmlFor="capacity" className="block text-sm font-medium mb-1">
          Capacitée:
        </label>
        <Input
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
        ></Input>

        <DialogFooter>
          <Button onClick={handleCreateRoom} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {`Créer la salle`}
          </Button>
          <DialogClose>
            <Button variant={"secondary"}>{`Annuler`}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
