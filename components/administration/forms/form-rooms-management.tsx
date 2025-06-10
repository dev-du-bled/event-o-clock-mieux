import { Armchair, Plus, Trash, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCinemaRooms } from "@/lib/db/cinema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default async function FormRoomsManagement() {
  return (
    <div className="p-4 bg-secondary rounded-2xl min-w-0">
      {/* card header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Armchair className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Gestion des salles</h2>
        </div>
        <Dialog>
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

            <DialogFooter>
              <Button
              // onClick={}
              >{`Créer`}</Button>
              <DialogClose>
                <Button variant={"secondary"}>{`Annuler`}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* card content */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell>Nombre de sièges</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(await getCinemaRooms()).map(room => (
            <TableRow key={room.id}>
              <TableCell>{room.id}</TableCell>
              <TableCell>{room.name}</TableCell>
              <TableCell>{room.capacity}</TableCell>
              <TableCell
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <Dialog>
                  <DialogTrigger>
                    <Button variant={"destructive"}>
                      <Trash />
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {`Supprimer la salle "${room?.name}" ?`}
                      </DialogTitle>
                    </DialogHeader>

                    <DialogDescription>
                      {`La salle "${room?.name}", ainsi que toutes les réservations la concernant seront supprimées, continuer?`}
                    </DialogDescription>
                    <DialogFooter>
                      <Button
                        variant={"destructive"}
                        // TODO: After merging this branch into main, create a function in @lib/db/cinema to delete a room
                        // onClick={}
                      >{`Supprimer la salle "${room?.name}"`}</Button>
                      <DialogClose>
                        <Button variant={"secondary"}>{`Annuler`}</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant={"outline"}>
                  <Pencil />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
