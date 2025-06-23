"use client";

import { Loader2 } from "lucide-react";
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
import {
  deleteEventAction,
  redirectAfterSuccess,
} from "@/server/actions/events";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteEventDialogProps {
  children: React.ReactNode;
  event: Event;
}

export default function DeleteEventDialog({
  children,
  event,
}: DeleteEventDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const deleteEventClick = async () => {
    setLoading(true);

    try {
      const result = await deleteEventAction(event.id);

      if (result.success) {
        toast("Succès", {
          description: `L'évènement "${event.title}" a été supprimé avec succès.`,
        });
        // ferme le dialog si succès
        setOpen(false);
        redirectAfterSuccess("/events");
      } else {
        toast("Erreur", {
          description:
            result.message ||
            `Erreur lors de la suppression de l'évènement "${event.title}".`,
          closeButton: true,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast("Erreur", {
        description: `Erreur lors de la suppression de l'évènement "${event.title}".`,
        closeButton: true,
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Confirmer la suppression
          </DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Êtes-vous sûr de vouloir supprimer l&apos;événement &quot;
          {event.title}&quot; ? Cette action est irréversible.
        </p>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={deleteEventClick}
          >
            {loading && <Loader2 className="animate-spin" />}
            Supprimer
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
