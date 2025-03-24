'use client';


/**
 * @file page.tsx
 * @brief User registration page component
 * @details Handles new user registration with email verification and password validation
 */

import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle } from 'lucide-react';

/**
 * @brief User registration component
 * @details Manages user registration process including:
 *          - Email and password validation
 *          - Password strength requirements
 *          - Account creation via Firebase
 *          - Email verification
 *          - Error handling
 * 
 * @returns React component for registration page
 */
export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const digitRegex = /\d/;
    const uppercaseRegex = /[A-Z]/;
  
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
  
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
  
    if (!specialCharRegex.test(password)) {
      setError('Le mot de passe doit contenir au moins un caractère spécial');
      return;
    }
  
    if (!digitRegex.test(password)) {
      setError('Le mot de passe doit contenir au moins un chiffre');
      return;
    }
  
    if (!uppercaseRegex.test(password)) {
      setError('Le mot de passe doit contenir au moins une majuscule');
      return;
    }
  
    setLoading(true);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setVerificationEmailSent(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé');
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
      setLoading(false);
    }
  };
  

  if (verificationEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Vérifiez votre email</h2>
            <p className="mt-2 text-gray-600">
              Un email de confirmation a été envoyé à {email}. Veuillez cliquer sur le lien dans l'email pour vérifier votre compte.
            </p>
            <div className="mt-6">
              <Link href="/login" className="text-primary hover:text-primary/80">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Inscription</h2>
          <p className="mt-2 text-gray-600">
            Créez votre compte pour rejoindre la communauté.
            
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full rounded-lg border border-gray-300 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full rounded-lg border border-gray-300 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 block w-full rounded-lg border border-gray-300 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}