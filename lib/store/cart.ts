import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/lib/db/cinema";

/**
 * Interface representing the Cart store state and actions.
 */
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (seatId: string, roomId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getRoomNumber: (roomId: string) => string;
}

/**
 * Zustand store to manage the cinema cart, using persistence middleware
 * to store cart data in the local storage.
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      /**
       * Adds an item to the cart if it doesn't already exist.
       *
       * @param item - The CartItem object to add to the cart.
       */
      addItem: item => {
        set(state => {
          const exists = state.items.some(
            existingItem =>
              existingItem.seatId === item.seatId &&
              existingItem.roomId === item.roomId
          );

          if (!exists) {
            return { items: [...state.items, item] };
          }
          return state;
        });
      },
      /**
       * Removes an item from the cart by matching seatId and roomId.
       *
       * @param seatId - The unique identifier of the seat to remove.
       * @param roomId - The unique identifier of the room where the seat belongs.
       */
      removeItem: (seatId, roomId) => {
        set(state => ({
          items: state.items.filter(
            item => !(item.seatId === seatId && item.roomId === roomId)
          ),
        }));
      },
      /**
       * Clears all items from the cart.
       */
      clearCart: () => {
        set({ items: [] });
      },
      /**
       * Calculates the total price of all items in the cart.
       *
       * @returns The total amount of all items in the cart.
       */
      getTotalAmount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.price, 0);
      },
      /**
       * Extracts and returns the room number from a roomId string.
       * Assumes that the roomId contains a number, and returns that number as a string.
       *
       * @param roomId - The unique identifier of the room (may contain a number).
       * @returns The extracted room number as a string, or '1' if no number is found.
       */
      getRoomNumber: (roomId: string) => {
        const match = roomId.match(/\d+/);
        return match ? match[0] : "1";
      },
    }),
    {
      name: "cinema-cart",
      storage: {
        /**
         * Custom getItem method for retrieving the cart state from localStorage.
         *
         * @param name - The name of the storage key to retrieve.
         * @returns The parsed cart data or null if not found.
         */
        getItem: name => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const data = JSON.parse(str);
            return {
              state: {
                ...data.state,
                items: data.state.items || [],
              },
            };
          } catch {
            return null;
          }
        },
        /**
         * Custom setItem method for saving the cart state to localStorage.
         *
         * @param name - The name of the storage key.
         * @param value - The value (cart state) to store in localStorage.
         */
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        /**
         * Custom removeItem method for removing the cart state from localStorage.
         *
         * @param name - The name of the storage key to remove.
         */
        removeItem: name => localStorage.removeItem(name),
      },
    }
  )
);
