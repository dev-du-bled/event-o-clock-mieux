"use client";

import { authClient } from "@/lib/auth/auth-client";
import { Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // TODO: zod i beg

    await authClient.signUp.email(
      {
        email,
        password,
        name,
        image: undefined,
      },
      {
        onRequest() {
          setLoading(true);
        },
        onSuccess() {
          setLoading(false);
          router.push("/");
        },
        onError(ctx) {
          setError(ctx.error.message || "Erreur lors de la création du compte");
          setLoading(false);
        },
      }
    );
  };

  return (
    <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive" className="mb-4 p-4">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nom
          </label>
          <div className="mt-1 relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="name"
              type="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="pl-10 block w-full rounded-lg border border-gray-300 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="mon nom"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="mt-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-10 block w-full rounded-lg border border-gray-300 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="vous@exemple.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mot de passe
          </label>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 block w-full rounded-lg border border-gray-300 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirmer le mot de passe
          </label>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </div>
    </form>
  );
}
