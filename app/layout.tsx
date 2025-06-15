import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Event'O'Clock - Votre plateforme de gestion d'événements",
  description: "Découvrez et gérez des événements passionnants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        )}
      </head>
      <body className={inter.className}>
        <Navbar />
        <div className="pt-16">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
