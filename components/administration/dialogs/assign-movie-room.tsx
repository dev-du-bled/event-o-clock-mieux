"use client";

import { CalendarRange } from "lucide-react";
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
import { assignMovieRoomAction } from "@/server/actions/rooms";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CinemaRoom } from "@prisma/client";
import FilmPicker from "@/components/ui/filmpicker";
import { Input } from "@/components/ui/input";

interface EditRoomDialogProps {
  room: CinemaRoom;
}

export default function AssignMovieDialog({ room: room }: EditRoomDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [showtime, setShowtime] = useState("");

  const handleAssignMovie = async (value: { id: string; title: string }) => {
    if (!room.id) return;

    try {
      const result = await assignMovieRoomAction(room.id, value.id, showtime);

      if (result.success) {
        toast("Succès", {
          description: `Film "${value.title}" sera joué à ${showtime}.`,
        });

        setOpen(false);
        router.refresh();
      } else {
        toast("Erreur", {
          description:
            result.message ||
            `Impossible d'assigner un film à la salle "${room?.name}".`,
          closeButton: true,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation", error);
      toast("Erreur", {
        description: `Erreur lors de l'assignation du film à la salle  "${room?.name}".`,
        closeButton: true,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"icon"}>
          <CalendarRange />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner un film à &quot;{room.name}&quot;</DialogTitle>
        </DialogHeader>

        <label htmlFor="time-selector">Planifier le film</label>
        <Input
          type="time"
          id="time-selector"
          name="Schedule movie"
          onChange={e => {
            setShowtime(e.target.value);
          }}
        />

        <FilmPicker onSubmit={handleAssignMovie} />

        <DialogFooter>
          <DialogClose>
            <Button variant={"secondary"}>{`Annuler`}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
