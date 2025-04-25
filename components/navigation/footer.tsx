"use client";

import Link from "next/link";
import { Calendar, Facebook, Instagram, Twitter } from "lucide-react";
import { toast } from "sonner";
import { AboutModal } from "../about/about-modal";

const toastStrings = [
  {
    title: "Réseaux Sociaux",
    description:
      "Aucun compte de réseaux sociaux n'est disponible pour le moment.",
  },
  {
    title: "Politique de confidentialité",
    description:
      "Nous accordons une grande importance à la protection de vos données personnelles. Consultez notre politique de confidentialité pour en savoir plus.",
  },
  {
    title: "Politique des cookies",
    description:
      "Information sur les cookies : Ce site ne collecte et n'utilise aucun cookie pour son fonctionnement.",
  },
  {
    title: "Conditions d'utilisation",
    description:
      "En utilisant notre site, vous acceptez nos conditions d'utilisation qui définissent les règles d'utilisation de nos services.",
  },
];

const socialIcons = [
  <Facebook key="facebook" className="h-5 w-5" />,
  <Twitter key="twitter" className="h-5 w-5" />,
  <Instagram key="instagram" className="h-5 w-5" />,
];

/**
 * Footer component that includes social media links, legal links, quick links, and modals
 */
export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        {/* Alerts */}

        {/* <AboutModal
          show={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        /> */}

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
                <AboutModal />
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
              {toastStrings.map(elt => {
                return (
                  <li key={elt.title}>
                    <button
                      onClick={() =>
                        toast(elt.title, {
                          description: elt.description,
                          closeButton: true,
                        })
                      }
                      className="text-start text-gray-600 hover:text-primary transition-colors"
                    >
                      {elt.title}
                    </button>
                  </li>
                );
              })}
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
              {socialIcons.map(icon => {
                return (
                  <button
                    key={icon.key}
                    onClick={() =>
                      toast(toastStrings[0].title, {
                        description: toastStrings[0].description,
                        closeButton: true,
                      })
                    }
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
