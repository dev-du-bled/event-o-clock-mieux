"use client";

import Link from "next/link";
import { Calendar, Facebook, Instagram, Twitter } from "lucide-react";
import { Alert } from "flowbite-react";
import { useState } from "react";
import { AboutModal } from "@/components/about/about-modal";

/**
 * Footer component that includes social media links, legal links, quick links, and modals
 * It manages the visibility of alerts for social media, cookies, terms of use, and privacy policy
 * -handleSocialClick: to handle the click on social media buttons
 * -handleCookieClick: to handle the click on the cookie policy button
 * -handleTermsClick: to handle the click on the terms of use button
 * -handlePrivacyClick: to handle the click on the privacy policy button
 */
export function Footer() {
  const [showSocialAlert, setShowSocialAlert] = useState(false);
  const [showCookieAlert, setShowCookieAlert] = useState(false);
  const [showTermsAlert, setShowTermsAlert] = useState(false);
  const [showPrivacyAlert, setShowPrivacyAlert] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleSocialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSocialAlert(true);
    setTimeout(() => setShowSocialAlert(false), 3000);
  };

  const handleCookieClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCookieAlert(true);
    setTimeout(() => setShowCookieAlert(false), 3000);
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTermsAlert(true);
    setTimeout(() => setShowTermsAlert(false), 3000);
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPrivacyAlert(true);
    setTimeout(() => setShowPrivacyAlert(false), 3000);
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        {/* Alerts */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {showSocialAlert && (
            <Alert color="warning" onDismiss={() => setShowSocialAlert(false)}>
              <span className="font-medium">
                Aucun compte de réseaux sociaux n&apos;est disponible pour le
                moment.
              </span>
            </Alert>
          )}

          {showCookieAlert && (
            <Alert color="info" onDismiss={() => setShowCookieAlert(false)}>
              <span className="font-medium">
                Information sur les cookies : Ce site ne collecte et
                n&apos;utilise aucun cookie pour son fonctionnement.
              </span>
            </Alert>
          )}

          {showTermsAlert && (
            <Alert color="info" onDismiss={() => setShowTermsAlert(false)}>
              <span className="font-medium">
                En utilisant notre site, vous acceptez nos conditions
                d&apos;utilisation qui définissent les règles d&apos;utilisation
                de nos services.
              </span>
            </Alert>
          )}

          {showPrivacyAlert && (
            <Alert color="info" onDismiss={() => setShowPrivacyAlert(false)}>
              <span className="font-medium">
                Nous accordons une grande importance à la protection de vos
                données personnelles. Consultez notre politique de
                confidentialité pour en savoir plus.
              </span>
            </Alert>
          )}
        </div>

        <AboutModal
          show={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">
                Event&apos;O&apos;Clock
              </span>
            </div>
            <p className="mt-4 text-gray-600 max-w-md">
              Découvrez et participez à des événements exceptionnels. Notre
              plateforme vous connecte aux meilleurs événements près de chez
              vous.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Liens rapides</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setShowAboutModal(true)}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  À propos
                </button>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Légal</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={handlePrivacyClick}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button
                  onClick={handleTermsClick}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Conditions d&apos;utilisation
                </button>
              </li>
              <li>
                <button
                  onClick={handleCookieClick}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Politique des cookies
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre inférieure */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Event&apos;O&apos;Clock. Tous droits
              réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button
                onClick={handleSocialClick}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </button>
              <button
                onClick={handleSocialClick}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button
                onClick={handleSocialClick}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
