"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCartStore } from "@/lib/store/cart";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CinemaRoom } from "@prisma/client";
import { DEFAULT_PRICES, ROOM_CONFIG } from "@/types/types";
import { Button } from "../ui/button";

interface CinemaDialogProps {
  room: CinemaRoom;
}

export default function SeatsCinemaDialog({ room }: CinemaDialogProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [ticketType, setTicketType] = useState<"child" | "adult" | "student">(
    "adult"
  );
  const [selectedSeats, setSelectedSeats] = useState<
    {
      seatId: string;
      ticketType: "child" | "adult" | "student";
      price: number;
    }[]
  >([]);

  const handleAddToCart = () => {
    /**
     * @brief Add selected seats to cart
     * @details Adds selected seats to the cart using Zustand
     * @note This function adds each selected seat to the cart using the addItem function from the cart store
     * @note The function resets the selection and redirects to the cart
     */
    if (selectedSeats.length === 0 || !room?.currentMovie) return;

    selectedSeats.forEach(seat => {
      addItem({
        roomId: room.id!,
        // @ts-expect-error issou
        movieId: room.currentMovie.id,
        seatId: seat.seatId,
        price: seat.price,
        ticketType: seat.ticketType,
      });
    });

    setSelectedSeats([]);

    router.push("/cinema/cart");
  };

  const handleSeatClick = (seatId: string) => {
    if (!room?.currentMovie) return;

    const existingSeatIndex = selectedSeats.findIndex(
      item => item.seatId === seatId
    );

    if (existingSeatIndex !== -1) {
      setSelectedSeats(prev =>
        prev.filter((_, index) => index !== existingSeatIndex)
      );
    } else {
      const price = DEFAULT_PRICES[ticketType];
      setSelectedSeats(prev => [
        ...prev,
        {
          seatId,
          ticketType,
          price,
        },
      ]);
    }
  };

  const renderSeatMap = (room: CinemaRoom) => {
    const rows = Array.from({ length: ROOM_CONFIG.rows }, (_, rowIndex) =>
      String.fromCharCode(65 + rowIndex)
    );

    return (
      <div className="space-y-4">
        {/* Screen */}
        <div className="w-full h-8 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600">
          Écran
        </div>

        {/* TicketType */}
        <div className="flex justify-center gap-4 mb-4">
          <select
            value={ticketType}
            onChange={e =>
              setTicketType(e.target.value as "child" | "adult" | "student")
            }
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="child">
              Enfant ({DEFAULT_PRICES.child.toFixed(2)} €)
            </option>
            <option value="adult">
              Adulte ({DEFAULT_PRICES.adult.toFixed(2)} €)
            </option>
            <option value="student">
              Étudiant ({DEFAULT_PRICES.student.toFixed(2)} €)
            </option>
          </select>
        </div>

        {/* Seat */}
        <div className="grid gap-4">
          {rows.map(row => (
            <div key={row} className="flex justify-center gap-2">
              <span className="w-6 text-center text-gray-500">{row}</span>
              {Array.from({ length: ROOM_CONFIG.seatsPerRow }, (_, index) => {
                const seatId = `${row}${index + 1}`;
                const seat = room.seats.find(s => s.id === seatId);
                const isSelected = selectedSeats.some(
                  item => item.seatId === seatId
                );
                const isAvailable = seat?.isAvailable ?? true;

                return (
                  <button
                    key={seatId}
                    onClick={() => isAvailable && handleSeatClick(seatId)}
                    disabled={!isAvailable}
                    className={`w-8 h-8 rounded-t-lg flex items-center justify-center text-sm
                      ${
                        isSelected
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      }
                      ${
                        !isAvailable
                          ? "bg-red-300 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      transition-colors`}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : index + 1}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-300 rounded"></div>
            <span>Occupé</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Voir les sièges</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plan des sièges - {room?.name}</DialogTitle>
        </DialogHeader>
        <div>{room && renderSeatMap(room)}</div>
        <DialogFooter>
          <Button
            onClick={handleAddToCart}
            disabled={selectedSeats.length === 0}
          >
            Ajouter au panier{" "}
            {selectedSeats.length > 0 &&
              `(${selectedSeats
                .reduce((sum, item) => sum + item.price, 0)
                .toFixed(2)} €)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
