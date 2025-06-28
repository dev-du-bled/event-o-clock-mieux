"use client";

import { Loader2, Pencil } from "lucide-react";
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
import { editRoomAction } from "@/server/actions/rooms";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { CinemaRoom } from "@prisma/client";

interface EditRoomDialogProps {
  room: CinemaRoom;
}

export default function EditRoomDialog({ room: room }: EditRoomDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>(room.name);

  const handleEditRoom = async () => {
    setLoading(true);

    if (room.id == null) return;

    try {
      const result = await editRoomAction(room.id, roomName);

      if (result.success) {
        toast("Succès", {
          description: `La salle "${roomName}" a été modifiée avec succès.`,
        });

        setOpen(false);
        router.refresh();
      } else {
        toast("Erreur", {
          description:
            result.message || `Impossible de modifier la salle "${roomName}".`,
          closeButton: true,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast("Erreur", {
        description: `Erreur lors de la modification de la salle "${roomName}".`,
        closeButton: true,
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"icon"}>
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Editer la salle`}</DialogTitle>
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
          placeholder={room.name}
          className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        ></Input>

        <DialogFooter>
          <Button onClick={handleEditRoom} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Appliquer
          </Button>
          <DialogClose>
            <Button variant={"secondary"}>{`Annuler`}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
