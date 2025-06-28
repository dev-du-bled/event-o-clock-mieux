import { Input } from "./input";
import { Button } from "./button";
import { useState } from "react";
import { searchFilmsAction } from "@/server/actions/films";
import { Search } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import { Movie } from "@/types/types";
import Image from "next/image";
import { toast } from "sonner";

interface FilmPickerProps {
  onSubmit: (value: { id: string; title: string }) => void;
}

export default function FilmPicker({ onSubmit }: FilmPickerProps) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<[Movie]>();

  const handleSearch = async () => {
    if (!query) return;

    const r = await searchFilmsAction(query);

    if (!r.success) {
      toast("Erreur", {
        description: r.message || `Impossible de rechercher des films.`,
        closeButton: true,
      });
    }

    if ((r.results as Array<Movie>).length === 0) {
      toast("Erreur", {
        description: `Aucun films trouvé.`,
        closeButton: true,
      });
    }

    setResults(r.results);
  };

  return (
    <>
      {/* Header */}
      <div className="flex gap-1.5">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          type="text"
          placeholder="Recherche"
          className="inline"
          // 🤫 This is where I would use something better, IF I HAD ANY !!!!!! *clenches fist*
          onKeyPress={e => {
            if (e.key === "Enter") handleSearch();
          }}
        />

        <Button className="inline" onClick={handleSearch}>
          <Search />
        </Button>
      </div>
      {/* Search results */}
      <div className="grid grid-cols-3 gap-3.5 max-h-100 overflow-scroll">
        {results?.map(f => (
          <Image
            alt={"Affiche du film " + f.title}
            src={getImageUrl(f.poster_path)}
            className="rounded-xl hover:scale-95 transition-transform hover:cursor-pointer"
            width={150}
            height={150}
            key={f.id}
            onClick={() => onSubmit({ id: `${f.id}`, title: f.title })}
          />
        ))}
      </div>
    </>
  );
}
