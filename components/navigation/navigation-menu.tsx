"use client";

import { ChevronDown, LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useNavigationMenu } from "./hooks/useNavigationMenu";
import { auth } from "@/lib/auth/auth";
import { getCartAction } from "@/server/actions/cart";

type NavigationMenuProps = {
  initialSession: Awaited<ReturnType<typeof auth.api.getSession>>;
};

export default function NavigationMenu({
  initialSession,
}: NavigationMenuProps) {
  const { user, pathname, canManageEvents, menuLinks, authLinks } =
    useNavigationMenu(initialSession);

  const router = useRouter();
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ferme le menu desktop quand la souris clique en dehors
    const menuHandler = (e: MouseEvent) => {
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(e.target as Node)
      ) {
        setIsDesktopOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", menuHandler);
    return () => document.removeEventListener("mousedown", menuHandler);
  });

  useEffect(() => {
    const getCartCount = async () => {
      const { cart } = await getCartAction();
      if (cart) {
        setCartCount(cart.items.length);
      }
    };

    getCartCount();
  }, []);

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(pathname);
          setIsDesktopOpen(false);
          setIsMobileOpen(false);
        },
      },
    });
  };

  // Menu Desktop
  const DesktopMenu = () => {
    if (!user) {
      return (
        <>
          <Button variant={"outline"} asChild>
            <Link href={authLinks.login.href}>Connexion</Link>
          </Button>
          <Button asChild>
            <Link href={authLinks.register.href}>Inscription</Link>
          </Button>
        </>
      );
    }

    return (
      <div className="relative items-center flex" ref={desktopMenuRef}>
        <Link href="/cart" className="relative flex items-center px-4 py-2">
          <ShoppingCart className="mr-1 h-5 w-5" />
          Panier
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">
              {cartCount}
            </span>
          )}
        </Link>
        <button
          className="group flex hover:cursor-pointer"
          onClick={() => setIsDesktopOpen(!isDesktopOpen)}
          data-state={isDesktopOpen ? "open" : "closed"}
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

        {isDesktopOpen && (
          <div className="absolute w-55 top-10 right-0 rounded-lg shadow-lg border bg-primary-foreground">
            <div className="px-4 py-2 space-y-2">
              {/* Mon profil */}
              {menuLinks.userLinks
                .filter(link => link.href === "/profile")
                .map(link => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      onClick={() => setIsDesktopOpen(false)}
                      href={link.href}
                      className="flex items-center"
                    >
                      <span className="flex items-center">
                        <Icon className="w-5 h-5 mr-1" />
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

              {/* Liens organisateurs */}
              {canManageEvents &&
                menuLinks.organizerLinks
                  .filter(link => link.condition !== false)
                  .map(link => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        onClick={() => setIsDesktopOpen(false)}
                        href={link.href}
                        className="flex items-center"
                      >
                        <span className="flex items-center">
                          <Icon className="w-5 h-5 mr-1" />
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}

              {/* Favoris */}
              {menuLinks.userLinks
                .filter(link => link.href === "/favorites")
                .map(link => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      onClick={() => setIsDesktopOpen(false)}
                      href={link.href}
                      className="flex items-center"
                    >
                      <span className="flex items-center">
                        <Icon className="w-5 h-5 mr-1" />
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

              {/* Liens admin */}
              {menuLinks.adminLinks
                .filter(link => link.condition)
                .map(link => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      onClick={() => setIsDesktopOpen(false)}
                      href={link.href}
                      className="flex items-center"
                    >
                      <span className="flex items-center">
                        <Icon className="w-5 h-5 mr-1" />
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

              <button
                onClick={logout}
                className="hover:cursor-pointer w-full text-left"
              >
                <span className="flex items-center">
                  <LogOut className="mr-1 h-5 w-5" />
                  Déconnexion
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Menu Mobile
  const MobileMenu = () => {
    return (
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex justify-center"
        >
          {isMobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {isMobileOpen && (
          <div
            className="fixed bg-background border top-16 left-0 w-full px-4 py-4"
            ref={mobileMenuRef}
          >
            <div className="flex flex-col space-y-4">
              {/* Liens publics */}
              {menuLinks.publicLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    href={link.href}
                  >
                    <span className="flex items-center">
                      <Icon className="mr-1 h-5 w-5" />
                      {link.label}
                    </span>
                  </Link>
                );
              })}

              {user ? (
                <>
                  {/* Liens organisateurs */}
                  {menuLinks.organizerLinks
                    .filter(link => link.condition !== false)
                    .map(link => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          onClick={() => setIsMobileOpen(false)}
                          href={link.href}
                        >
                          <span className="flex items-center">
                            <Icon className="mr-1 h-5 w-5" />
                            {link.label}
                          </span>
                        </Link>
                      );
                    })}

                  {/* Liens utilisateur */}
                  {menuLinks.userLinks
                    .filter(link => link.href !== "/profile")
                    .map(link => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          onClick={() => setIsMobileOpen(false)}
                          href={link.href}
                        >
                          <span className="flex items-center">
                            <Icon className="mr-1 h-5 w-5" />
                            {link.label}
                          </span>
                        </Link>
                      );
                    })}

                  {/* Profil avec avatar */}
                  <Link onClick={() => setIsMobileOpen(false)} href="/profile">
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

                  {/* Liens admin */}
                  {menuLinks.adminLinks
                    .filter(link => link.condition)
                    .map(link => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          onClick={() => setIsMobileOpen(false)}
                          href={link.href}
                          className="flex items-center"
                        >
                          <span className="flex items-center">
                            <Icon className="mr-1 h-5 w-5" />
                            {link.label}
                          </span>
                        </Link>
                      );
                    })}

                  <button
                    onClick={logout}
                    className="hover:cursor-pointer w-full text-left"
                  >
                    <span className="flex items-center">
                      <LogOut className="mr-1 h-5 w-5" />
                      Déconnexion
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {(() => {
                    const LoginIcon = authLinks.login.icon;
                    return (
                      <Link
                        onClick={() => setIsMobileOpen(false)}
                        href={authLinks.login.href}
                      >
                        <span className="flex items-center">
                          <LoginIcon className="mr-1 h-5 w-5" />
                          {authLinks.login.label}
                        </span>
                      </Link>
                    );
                  })()}
                  {(() => {
                    const RegisterIcon = authLinks.register.icon;
                    return (
                      <Link
                        onClick={() => setIsMobileOpen(false)}
                        href={authLinks.register.href}
                      >
                        <span className="flex items-center">
                          <RegisterIcon className="mr-1 h-5 w-5" />
                          {authLinks.register.label}
                        </span>
                      </Link>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Menu */}
      <nav className="hidden space-x-4 md:flex">
        <DesktopMenu />
      </nav>

      {/* Mobile Menu */}
      <MobileMenu />
    </>
  );
}
