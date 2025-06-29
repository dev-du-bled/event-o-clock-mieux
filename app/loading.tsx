/**
 * @file loading.tsx
 * @brief loading component
 * @details Displays loading while the homepage content is being fetched
 */
import Link from "next/link";
import InputSearchEvent from "@/components/events/inputs/input-search-event";

/**
 * @brief Loading component
 * @details Main Loading page component featuring:
 * @returns React component for Loading
 */
export default async function Loading() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="h-[600px] flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Découvrez des événements exceptionnels
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Trouvez et participez à des événements uniques près de chez vous
          </p>
          <InputSearchEvent variant="form" />
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 container px-4 mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Événements à la une
          </h2>
          <Link
            href="/events"
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Voir tous les événements
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        </div>
      </section>
    </main>
  );
}
