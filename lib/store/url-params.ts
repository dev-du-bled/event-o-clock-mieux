import { create } from "zustand";

type storeParams = {
  search: string;
  location: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  startDate: string;
  endDate: string;
  setSearch: (search: string) => void;
  setLocation: (location: string) => void;
  setCategory: (category: string) => void;
  setMinPrice: (minPrice: number) => void;
  setMaxPrice: (maxPrice: number) => void;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
};

export const useStoreParams = create<storeParams>(set => ({
  search: "",
  location: "",
  category: "",
  minPrice: 0,
  maxPrice: 100,
  startDate: "",
  endDate: "",
  setSearch: (search: string) => set({ search }),
  setLocation: (location: string) => set({ location }),
  setCategory: (category: string) => set({ category }),
  setMinPrice: (minPrice: number) => set({ minPrice }),
  setMaxPrice: (maxPrice: number) => set({ maxPrice }),
  setStartDate: (startDate: string) => set({ startDate }),
  setEndDate: (endDate: string) => set({ endDate }),
}));
