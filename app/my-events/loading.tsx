/**
 * @file loading.tsx
 * @brief loading component
 * @details Displays loading while the page content is being fetched
 */
import Link from "next/link";

/**
 * @brief Loading component
 * @details Main Loading component featuring:
 * @returns React component for Loading
 */

export default async function Loading() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mes événements</h1>
          <Link
            href="/create-event"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Créer un événement
          </Link>
        </div>

        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
