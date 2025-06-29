/**
 * @file loading.tsx
 * @brief loading component
 * @details Displays loading while the page content is being fetched
 */

/**
 * @brief Loading component
 * @details Main Loading component
 * @returns React component for Loading
 */
export default async function Loading() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mes favoris</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
