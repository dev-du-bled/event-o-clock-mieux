import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">401</h1>
      <p className="mt-2 text-center">
        Vous n&apos;êtes pas autorisé à accéder à cette page.
      </p>
      <Link
        href={"/"}
        className="text-primary/45 hover:text-primary text-center text-sm hover:underline"
      >
        Retour a l&apos;accueil
      </Link>
    </div>
  );
}
