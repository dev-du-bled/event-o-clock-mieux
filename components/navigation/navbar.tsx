// import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Film, Ticket } from "lucide-react";
// import { CartItem } from "@/lib/db/cinema";
import MobileMenu from "./mobile-menu";
import ProfileMenu from "./profile-menu";

/**
 * Navbar component that include menu
 * -updateCartCount: to update the cart
 * -setCartItemsCount: to set cart items count to parameter value
 * -setInterval: to check the cart count regularly
 */

export async function Navbar() {
  // const [cartItemsCount, setCartItemsCount] = useState(0);

  // useEffect(() => {
  //   const updateCartCount = () => {
  //     try {
  //       const cart = localStorage.getItem("cinemaCart");
  //       if (cart) {
  //         const items = JSON.parse(cart) as CartItem[];
  //         setCartItemsCount(items.length);
  //       } else {
  //         setCartItemsCount(0);
  //       }
  //     } catch (error) {
  //       console.error("Erreur lors de la lecture du panier:", error);
  //       setCartItemsCount(0);
  //     }
  //   };

  //   updateCartCount();

  //   const interval = setInterval(updateCartCount, 1000);

  //   const handleStorageChange = (e: StorageEvent) => {
  //     if (e.key === "cinemaCart") {
  //       updateCartCount();
  //     }
  //   };
  //   window.addEventListener("storage", handleStorageChange);

  //   return () => {
  //     clearInterval(interval);
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, []);

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
          <div className="ml-10 hidden items-center space-x-8 md:!flex ">
            <Link
              href="/events"
              className="hover:text-primary text-muted-foreground transition-colors"
            >
              <span className="flex items-center">
                <Ticket className="mr-1 h-5 w-5" />
                Découvrir
              </span>
            </Link>
            <Link
              href="/cinema"
              className="hover:text-primary text-muted-foreground transition-colors"
            >
              <span className="flex items-center">
                <Film className="mr-1 h-5 w-5" />
                Cinéma
              </span>
            </Link>
          </div>
        </nav>

        {/* Boutons d'action */}
        <nav className="hidden space-x-4 md:flex">
          <ProfileMenu />
        </nav>

        {/* Menu pour mobile */}
        <MobileMenu />
      </div>
    </header>
  );
}
