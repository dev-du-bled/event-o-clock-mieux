import Link from "next/link";

export default function NotAuthorized() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">
            Vous n&apos;êtes pas autorisé à accéder à cette page
          </h2>
          <Link href="/" className="text-primary hover:text-primary/80">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
