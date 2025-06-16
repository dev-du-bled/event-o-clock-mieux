"use client";

import { authClient } from "@/lib/auth/auth-client";
import { Mail, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

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
          if (decodeURIComponent(redirectTo) === "/login") {
            router.push("/");
          } else {
            router.push(decodeURIComponent(redirectTo));
          }
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
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <div className="mt-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError("");
              }}
              className="pl-10"
              placeholder="vous@exemple.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError("");
              }}
              className="pl-10"
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
