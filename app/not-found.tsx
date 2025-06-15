import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-center">
        La page que vous recherchez n&apos;existe pas.
      </p>
      <Link
        href={"/"}
        className="text-gray-600 hover:text-primary transition-colors text-center text-sm hover:underline"
      >
        Retour a l&apos;accueil
      </Link>
    </div>
  );
}
