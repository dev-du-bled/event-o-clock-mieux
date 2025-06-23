import { Armchair, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCinemaRooms } from "@/lib/db/cinema";
import DeleteRoomDialog from "../dialogs/delete-room";
import CreateRoomDialog from "../dialogs/create-room";
import EditRoomDialog from "../dialogs/edit-room";
import AssignMovieRoomDialog from "../dialogs/assign-movie-room";

export default async function FormRoomsManagement() {
  return (
    <div className="p-4 bg-secondary rounded-2xl min-w-0">
      {/* card header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Armchair className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Gestion des salles</h2>
        </div>
        <CreateRoomDialog />
      </div>

      {/* card content */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Nom</TableCell>
            <TableCell>Nombre de sièges</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(await getCinemaRooms()).map(room => (
            <TableRow key={room.id}>
              <TableCell>{room.name}</TableCell>
              <TableCell>{room.capacity}</TableCell>
              <TableCell
                style={{
                  display: "flex",
                  gap: 10,
                }}
              >
                <DeleteRoomDialog room={room} />
                <EditRoomDialog room={room} />
                <AssignMovieRoomDialog room={room} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
