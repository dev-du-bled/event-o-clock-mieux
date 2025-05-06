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
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
          <label className="block text-sm font-medium">Prix</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="w-20 p-2 border rounded-md"
              value={paramsStore.minPrice}
              onChange={e => paramsStore.setMinPrice(Number(e.target.value))}
              placeholder="Min"
            />
            <span>à</span>
            <input
              type="number"
              className="w-20 p-2 border rounded-md"
              value={paramsStore.maxPrice}
              onChange={e => paramsStore.setMaxPrice(Number(e.target.value))}
              placeholder="Max"
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium">Période</label>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              className="w-40 p-2 border rounded-md"
              value={paramsStore.startDate}
              onChange={e => paramsStore.setStartDate(e.target.value)}
            />
            <span>à</span>
            <input
              type="date"
              className="w-40 p-2 border rounded-md"
              value={paramsStore.endDate}
              onChange={e => paramsStore.setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
