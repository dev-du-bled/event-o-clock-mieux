import Link from "next/link";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Connexion</h2>
          <p className="mt-2 text-muted-foreground">
            Bienvenue ! Connectez-vous pour accéder à votre compte.
          </p>
        </div>

        <LoginForm />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
