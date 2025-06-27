// import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Film, Ticket } from "lucide-react";
// import { CartItem } from "@/lib/db/cinema";
import NavigationMenu from "./navigation-menu";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Navbar component that include menu
 * -updateCartCount: to update the cart
 * -setCartItemsCount: to set cart items count to parameter value
 * -setInterval: to check the cart count regularly
 */

export async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="fixed z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo and navigation  */}
        <nav className="flex items-center">
          <Link href="/" className="flex items-center">
            <Calendar className="text-primary h-8 w-8" />
            <span className="ml-2 text-xl font-bold">
              Event&apos;O&apos;Clock
            </span>
          </Link>
          <div className="ml-10 hidden items-center space-x-8 md:flex ">
            <Link href="/events">
              <span className="flex items-center">
                <Ticket className="mr-1 h-5 w-5" />
                Découvrir
              </span>
            </Link>
            <Link href="/cinema">
              <span className="flex items-center">
                <Film className="mr-1 h-5 w-5" />
                Cinéma
              </span>
            </Link>
          </div>
        </nav>

        {/* Menu de navigation unifié */}
        <NavigationMenu initialSession={session} />
      </div>
    </header>
  );
}
