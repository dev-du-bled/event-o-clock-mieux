'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Calendar, PlusCircle, Heart, User, Film, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { CartItem } from '@/lib/db/cinema';

/**
 * Navbar component that include menu
 * -updateCartCount: to update the cart
 * -setCartItemsCount: to set cart items count to parameter value
 * -setInterval: to check the cart count regularly
 */
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const [cartItemsCount, setCartItemsCount] = useState(0);

  const displayName = userProfile?.displayName || 'Mon profil';

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = localStorage.getItem('cinemaCart');
        if (cart) {
          const items = JSON.parse(cart) as CartItem[];
          setCartItemsCount(items.length);
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        console.error('Erreur lors de la lecture du panier:', error);
        setCartItemsCount(0);
      }
    };

    updateCartCount();

    const interval = setInterval(updateCartCount, 1000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cinemaCart') {
        updateCartCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and navigation  */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Event'O'Clock</span>
            </Link>
            <div className="hidden md:flex items-center ml-10 space-x-8">
              <Link href="/events" className="text-gray-600 hover:text-primary transition-colors">
                Découvrir
              </Link>
              <Link href="/cinema" className="text-gray-600 hover:text-primary transition-colors">
                <span className="flex items-center">
                  <Film className="w-5 h-5 mr-1" />
                  Cinéma
                </span>
              </Link>
              {user && (
                <>
                  <Link href="/my-events" className="text-gray-600 hover:text-primary transition-colors">
                    Mes événements
                  </Link>
                  <Link href="/favorites" className="text-gray-600 hover:text-primary transition-colors">
                    <span className="flex items-center">
                      <Heart className="w-5 h-5 mr-1" />
                      Favoris
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                {/* Panier */}
                <Link 
                  href="/cinema/cart" 
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-primary transition-colors relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                <Link href="/create-event" className="flex items-center px-4 py-2 text-gray-600 hover:text-primary transition-colors">
                  <PlusCircle className="w-5 h-5 mr-1" />
                  Créer un événement
                </Link>
                <Link href="/profile" className="flex items-center px-4 py-2 text-gray-600 hover:text-primary transition-colors">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Photo de profil"
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 mr-1" />
                  )}
                  <span>{displayName}</span>
                </Link>
              </>
            )}
            {!user ? (
              <>
                <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-primary transition-colors">
                  Connexion
                </Link>
                <Link href="/register" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Inscription
                </Link>
              </>
            ) : (
              <button
                onClick={() => auth.signOut()}
                className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
              >
                Déconnexion
              </button>
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-primary">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/events" className="text-gray-600 hover:text-primary transition-colors">
                Découvrir
              </Link>
              <Link href="/cinema" className="text-gray-600 hover:text-primary transition-colors">
                <span className="flex items-center">
                  <Film className="w-5 h-5 mr-1" />
                  Cinéma
                </span>
              </Link>
              {user && (
                <>
                  <Link href="/my-events" className="text-gray-600 hover:text-primary transition-colors">
                    Mes événements
                  </Link>
                  <Link href="/favorites" className="text-gray-600 hover:text-primary transition-colors">
                    <span className="flex items-center">
                      <Heart className="w-5 h-5 mr-1" />
                      Favoris
                    </span>
                  </Link>
                  <Link href="/cinema/cart" className="text-gray-600 hover:text-primary transition-colors">
                    <span className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-1" />
                      Panier {cartItemsCount > 0 && `(${cartItemsCount})`}
                    </span>
                  </Link>
                  <Link href="/profile" className="text-gray-600 hover:text-primary transition-colors">
                    <span className="flex items-center">
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt="Photo de profil"
                          className="w-6 h-6 rounded-full mr-2 object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 mr-1" />
                      )}
                      <span>{displayName}</span>
                    </span>
                  </Link>
                </>
              )}
              {user && (
                <Link href="/create-event" className="text-gray-600 hover:text-primary transition-colors">
                  <span className="flex items-center">
                    <PlusCircle className="w-5 h-5 mr-1" />
                    Créer un événement
                  </span>
                </Link>
              )}
              {!user ? (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-primary transition-colors">
                    Connexion
                  </Link>
                  <Link href="/register" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center">
                    Inscription
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => auth.signOut()}
                  className="text-gray-600 hover:text-primary transition-colors text-left"
                >
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}