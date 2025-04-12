"use client";

import { auth } from "@/lib/auth/auth";
import { ChevronDown, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LogOutButton from "../auth/logout-button";
import Link from "next/link";

export default function ProfileMenu(props: {
  user: typeof auth.$Infer.Session.user | undefined;
}) {
  const { user } = props;
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

  if (!user) return <></>;

  return (
    <div className="relative" ref={menuRef}>
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
        <div className="absolute z-10 w-60 top-8 right-0 rounded-lg shadow-lg bg-white border">
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
