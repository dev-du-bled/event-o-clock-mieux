"use client";

import SearchEvent from "./input-search-event";
import { Event } from "@prisma/client";
import { useStoreParams } from "@/lib/store/url-params";

interface FullInputSearchEventProps {
  events: Array<Event>;
}

export default function FullInputSearchEvent({
  events,
}: FullInputSearchEventProps) {
  const paramsStore = useStoreParams();

  const categories = Array.from(
    new Set(events.flatMap(event => event.categories))
  ).sort();

  return (
    <>
      <SearchEvent />
      <select
        value={paramsStore.category}
        onChange={e => paramsStore.setCategory(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option value="">Toutes les catégories</option>
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <div className="md:col-span-3 flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Prix
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              type="number"
              className="w-full sm:w-20 p-2 border border-input bg-background text-foreground rounded-md"
              value={paramsStore.minPrice}
              onChange={e => paramsStore.setMinPrice(Number(e.target.value))}
              placeholder="Min"
            />
            <input
              type="number"
              className="w-full sm:w-20 p-2 border border-input bg-background text-foreground rounded-md"
              value={paramsStore.maxPrice}
              onChange={e => paramsStore.setMaxPrice(Number(e.target.value))}
              placeholder="Max"
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground">
            Période
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              type="date"
              className="w-full sm:w-40 p-2 border border-input bg-background text-foreground rounded-md"
              value={paramsStore.startDate}
              onChange={e => paramsStore.setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="w-full sm:w-40 p-2 border border-input bg-background text-foreground rounded-md"
              value={paramsStore.endDate}
              onChange={e => paramsStore.setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
