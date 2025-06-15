import Link from "next/link";
import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Inscription</h2>
          <p className="mt-2 text-muted-foreground">
            Créez votre compte pour rejoindre la communauté.
          </p>
        </div>

        <RegisterForm />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
