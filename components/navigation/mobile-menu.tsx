"use client";

import { auth } from "@/lib/auth/auth";
import {
  Film,
  Heart,
  Menu,
  PlusCircle,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LogOutButton from "../auth/logout-button";

export default function MobileMenu(props: {
  user: typeof auth.$Infer.Session.user | undefined;
}) {
  const { user } = props;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ferme le menu quand la souris clique en dehors
    const menuHandler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", menuHandler);

    return () => document.removeEventListener("mousedown", menuHandler);
  });

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-center text-gray-600 hover:text-primary"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Menu mobile */}
      {isOpen && (
        <div
          className="fixed bg-white border top-16 left-0 w-full px-4 py-4"
          ref={menuRef}
        >
          <div className="flex flex-col space-y-4">
            <Link
              href="/events"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Découvrir
            </Link>
            <Link
              href="/cinema"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              <span className="flex items-center">
                <Film className="w-5 h-5 mr-1" />
                Cinéma
              </span>
            </Link>
            {user && (
              <>
                <Link
                  href="/my-events"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Mes événements
                </Link>
                <Link
                  href="/favorites"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <span className="flex items-center">
                    <Heart className="w-5 h-5 mr-1" />
                    Favoris
                  </span>
                </Link>
                <Link
                  href="/cinema/cart"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <span className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-1" />
                    Panier
                    {/* Panier {cartItemsCount > 0 && `(${cartItemsCount})`} */}
                  </span>
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <span className="flex items-center">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt="Photo de profil"
                        className="w-6 h-6 rounded-full mr-2 object-cover"
                        height={24}
                        width={24}
                      />
                    ) : (
                      <User className="w-5 h-5 mr-1" />
                    )}
                    <span>{user.name}</span>
                  </span>
                </Link>

                <Link
                  href="/create-event"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <span className="flex items-center">
                    <PlusCircle className="w-5 h-5 mr-1" />
                    Créer un événement
                  </span>
                </Link>
              </>
            )}
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Inscription
                </Link>
              </>
            ) : (
              <LogOutButton className="text-left" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
