"use client";

import { authClient } from "@/lib/auth/auth-client";
import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest() {
          setLoading(true);
        },
        onSuccess() {
          router.push("/");
        },
        onError(ctx) {
          setError(ctx.error.message || "Erreur lors de la connexion");
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
              onChange={e => {
                setEmail(e.target.value);
                setError("");
              }}
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
              onChange={e => {
                setPassword(e.target.value);
                setError("");
              }}
              className="pl-10 block w-full rounded-lg border border-gray-300 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </div>
    </form>
  );
}
