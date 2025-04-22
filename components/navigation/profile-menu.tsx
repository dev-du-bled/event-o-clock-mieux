"use client";

import { ChevronDown, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LogOutButton from "../auth/logout-button";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { Skeleton } from "../ui/skeleton";

export default function ProfileMenu() {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ferme le menu quand la souris clique en dehors
    // TODO: utiliser group-hover à la place ?
    const menuHandler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", menuHandler);

    return () => document.removeEventListener("mousedown", menuHandler);
  });

  if (isPending)
    return (
      <div className="flex items-center space-x-2 mr-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-15" />
      </div>
    );

  if (!user)
    return (
      <>
        <Link
          href="/login"
          className="hover:text-primary px-4 py-2 text-gray-600 transition-colors"
        >
          Connexion
        </Link>
        <Link
          href="/register"
          className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white transition-colors"
        >
          Inscription
        </Link>
      </>
    );

  return (
    <div className="relative items-center flex" ref={menuRef}>
      <Link
        href="/cinema/cart"
        className="hover:text-primary relative flex items-center px-4 py-2 text-gray-600 transition-colors"
      >
        <ShoppingCart className="mr-1 h-5 w-5" />
        Panier
        {/* {cartItemsCount > 0 && (
                        <span className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                      {cartItemsCount}
                       </span>
                        )} */}
      </Link>
      <button
        className="group flex text-gray-600 hover:text-primary transition-colors hover:cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        data-state={isOpen ? "open" : "closed"}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={`photo de profil de ${user.name}`}
            className="w-6 h-6 rounded-full mr-2 object-cover"
            height={24}
            width={24}
          />
        ) : (
          <User className="w-5 h-5 mr-1" />
        )}
        {user.name}
        <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
      </button>

      {isOpen && (
        <div className="absolute w-50 top-10 right-0 rounded-lg shadow-lg bg-white border">
          <div className="px-4 py-2 space-y-2">
            <Link
              href="/profile"
              className="flex items-center hover:text-primary text-gray-600 transition-colors"
            >
              Mon Profil
            </Link>
            <Link
              href="/create-event"
              className="flex items-center hover:text-primary text-gray-600 transition-colors"
            >
              Créer un événement
            </Link>
            <Link
              href="/my-events"
              className="flex items-center hover:text-primary text-gray-600 transition-colors"
            >
              Mes événements
            </Link>
            <Link
              href="/favorites"
              className="flex items-center hover:text-primary text-gray-600 transition-colors"
            >
              Favoris
            </Link>
            <LogOutButton className="flex w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
