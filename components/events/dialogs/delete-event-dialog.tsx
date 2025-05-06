"use client";

import { Loader2, Trash2 } from "lucide-react";
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
import { Event } from "@prisma/client";
import { deleteEvent } from "@/lib/db/events";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteEventDialogProps {
  event: Event;
}

export default function DeleteEventDialog({ event }: DeleteEventDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const deleteEventClick = async () => {
    setLoading(true);

    try {
      await deleteEvent(event.id).then(() => {
        toast("Succès", {
          description: `L'évènement "${event.title}" a été supprimé avec succès.`,
        });
        // ferme le dialog si succès
        setOpen(false);
      });
    } catch {
      toast("Error", {
        description: `Erreur lors de la suppression de l'évènement "${event.title}".`,
        closeButton: true,
      });
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="destructive">
          <Trash2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Confirmer la suppression
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">
          Êtes-vous sûr de vouloir supprimer l&apos;événement &quot;
          {event.title}&quot; ? Cette action est irréversible.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={deleteEventClick}
          >
            {loading && <Loader2 className="animate-spin" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
