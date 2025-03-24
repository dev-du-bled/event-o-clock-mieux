'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

interface RequireAuthProps {
  children: React.ReactNode; 
  message?: string;
}

/**
 * A component that ensures the user is authenticated before accessing its children.
 * 
 * If the user is not authenticated, it displays a message and a link to the login page.
 * Otherwise, it renders the child components.
 * 
 * @param children - The components to render if the user is authenticated.
 * @param message - Optional custom message to show when the user is not authenticated.
 */
export function RequireAuth({ children, message = "Vous devez être connecté pour accéder à cette page" }: RequireAuthProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">{message}</h2>
            <Link href="/login" className="text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}