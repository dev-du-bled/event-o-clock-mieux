"use client";

import {
  ChevronDown,
  Heart,
  PlusCircle,
  ShoppingCart,
  Tag,
  User,
  UserCircle2,
  LockKeyhole,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LogOutButton from "../auth/logout-button";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { Skeleton } from "../ui/skeleton";
import { Role } from "@prisma/client";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

export default function ProfileMenu() {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  const path = usePathname();
  const pathname = decodeURIComponent(path);

  const [canManageEvents, setCanManageEvents] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (user) {
        try {
          const result = await authClient.admin.hasPermission({
            permission: { event: ["create"] },
          });
          setCanManageEvents(result.data?.success || false);
        } catch (error) {
          console.error("Erreur vérification permissions:", error);
          setCanManageEvents(false);
        }
      } else {
        setCanManageEvents(false);
      }
    };

    checkPermissions();
  }, [user]);

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
        <Button variant={"outline"} asChild>
          <Link
            href={
              pathname === "/login" || pathname === "register"
                ? "/login"
                : `/login?redirectTo=${encodeURIComponent(path)}`
            }
          >
            Connexion
          </Link>
        </Button>
        <Button asChild>
          <Link href="/register">Inscription</Link>
        </Button>
      </>
    );

  return (
    <div className="relative items-center flex" ref={menuRef}>
      <Link
        href="/cinema/cart"
        className="relative flex items-center px-4 py-2"
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
        className="group flex hover:cursor-pointer"
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
        <div className="absolute w-55 top-10 right-0 rounded-lg shadow-lg border bg-primary-foreground">
          <div className="px-4 py-2 space-y-2">
            <Link
              onClick={() => setIsOpen(false)}
              href="/profile"
              className="flex items-center"
            >
              <span className="flex items-center">
                <UserCircle2 className="w-5 h-5 mr-1" />
                Mon Profil
              </span>
            </Link>

            {/* Liens pour les organisateurs - basé sur les permissions */}
            {canManageEvents && (
              <>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/create-event"
                  className="flex items-center"
                >
                  <span className="flex items-center">
                    <PlusCircle className="w-5 h-5 mr-1" />
                    Créer un événement
                  </span>
                </Link>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/my-events"
                  className="flex items-center"
                >
                  <span className="flex items-center">
                    <Tag className="mr-1 h-5 w-5" />
                    Mes événements
                  </span>
                </Link>
              </>
            )}

            <Link
              onClick={() => setIsOpen(false)}
              href="/favorites"
              className="flex items-center"
            >
              <span className="flex items-center">
                <Heart className="w-5 h-5 mr-1" />
                Favoris
              </span>
            </Link>

            {/* Lien admin - garde la vérification de rôle pour l'admin */}
            {user.role === Role.admin && (
              <Link
                onClick={() => setIsOpen(false)}
                href="/administration"
                className="flex items-center"
              >
                <span className="flex items-center">
                  <LockKeyhole className="w-5 h-5 mr-1" />
                  Administration
                </span>
              </Link>
            )}

            <LogOutButton
              onClick={() => setIsOpen(false)}
              className="flex w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
