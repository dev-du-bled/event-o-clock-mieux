"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { auth } from "@/lib/auth/auth";
import { Role } from "@prisma/client";
import {
  Clipboard,
  Film,
  Heart,
  LockKeyhole,
  LogIn,
  PlusCircle,
  ShoppingCart,
  Tag,
  Ticket,
  UserCircle2,
} from "lucide-react";

export type MenuLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  condition?: boolean;
};

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
type User = NonNullable<Session>["user"];

export type NavigationMenuData = {
  user: User | null;
  session: Session | null;
  pathname: string;
  path: string;
  canManageEvents: boolean;
  menuLinks: {
    publicLinks: MenuLink[];
    userLinks: MenuLink[];
    organizerLinks: MenuLink[];
    adminLinks: MenuLink[];
  };
  authLinks: {
    login: MenuLink;
    register: MenuLink;
  };
};

export function useNavigationMenu(initialSession: Session) {
  const { data: clientSession } = authClient.useSession();
  const session = clientSession || initialSession;
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

  // Définition centralisée de tous les liens
  const menuLinks: NavigationMenuData["menuLinks"] = {
    publicLinks: [
      {
        href: "/events",
        label: "Découvrir",
        icon: Ticket,
      },
      {
        href: "/cinema",
        label: "Cinéma",
        icon: Film,
      },
    ],
    userLinks: [
      {
        href: "/profile",
        label: "Mon Profil",
        icon: UserCircle2,
      },
      {
        href: "/favorites",
        label: "Favoris",
        icon: Heart,
      },
      {
        href: "/cinema/cart",
        label: "Panier",
        icon: ShoppingCart,
      },
    ],
    organizerLinks: [
      {
        href: "/create-event",
        label: "Créer un événement",
        icon: PlusCircle,
        condition: canManageEvents,
      },
      {
        href: "/my-events",
        label: "Mes événements",
        icon: Tag,
        condition: canManageEvents,
      },
    ],
    adminLinks: [
      {
        href: "/administration",
        label: "Administration",
        icon: LockKeyhole,
        condition: user?.role === Role.admin,
      },
    ],
  };

  const authLinks: NavigationMenuData["authLinks"] = {
    login: {
      href:
        pathname === "/login" || pathname === "/register"
          ? "/login"
          : `/login?redirectTo=${encodeURIComponent(path)}`,
      label: "Connexion",
      icon: LogIn,
    },
    register: {
      href: "/register",
      label: "Inscription",
      icon: Clipboard,
    },
  };

  return {
    user,
    session,
    pathname,
    path,
    canManageEvents,
    menuLinks,
    authLinks,
  } as NavigationMenuData;
}
