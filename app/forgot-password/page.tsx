'use client';

/**
 * @file page.tsx
 * @brief Password reset page component
 * @details Handles password reset functionality through email verification
 */
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

/**
 * @brief Password reset component
 * @details Manages the password reset flow including:
 *          - Email input validation
 *          - Reset email sending
 *          - Error handling
 *          - Success confirmation
 * 
 * @returns React component for password reset page
 */

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Aucun compte n\'existe avec cette adresse email');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresse email invalide');
      } else {
        setError('Une erreur est survenue lors de l\'envoi de l\'email');
        console.error('Reset password error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Mot de passe oublié</h2>
          <p className="mt-2 text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {!resetEmailSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            )}

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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="pl-10 block w-full rounded-lg border border-gray-300 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </div>

            <div className="text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-primary hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex items-center p-4 text-green-800 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <p>Un email de réinitialisation a été envoyé à {email}.</p>
            </div>
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
              </p>
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-primary hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}