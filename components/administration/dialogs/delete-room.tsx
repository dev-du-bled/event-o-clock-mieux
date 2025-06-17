"use client";

import { Loader2, Trash } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../../ui/dialog";
import { CinemaRoom } from "@prisma/client";
import { deleteRoomAction } from "@/server/actions/rooms";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteRoomDialogProps {
  room: CinemaRoom;
}

export default function DeleteRoomDialog({
  room: room,
}: DeleteRoomDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const handleDeleteRoom = async () => {
    setLoading(true);

    try {
      const result = await deleteRoomAction(room.id);

      if (result.success) {
        toast("Succès", {
          description: `La salle "${room.name}" a été supprimée avec succès.`,
        });

        setOpen(false);
        router.refresh();
      } else {
        toast("Erreur", {
          description:
            result.message ||
            `Erreur lors de la suppression de la salle "${room.name}".`,
          closeButton: true,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast("Erreur", {
        description: `Erreur lors de la suppression de la salle "${room.name}".`,
        closeButton: true,
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant={"destructive"} size={"icon"}>
          <Trash />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Supprimer la salle "${room?.name}" ?`}</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          {`La salle "${room?.name}", ainsi que toutes les réservations la concernant seront supprimées, continuer?`}
        </DialogDescription>
        <DialogFooter>
          <Button
            variant={"destructive"}
            disabled={loading}
            onClick={handleDeleteRoom}
          >
            {loading && <Loader2 className="animate-spin" />}
            {`Supprimer la salle "${room?.name}"`}
          </Button>
          <DialogClose>
            <Button variant={"secondary"}>{`Annuler`}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
