"use client";
/**
 * @file page.tsx
 * @brief FAQ page component
 * @details Displays frequently asked questions in an accordion format
 */

import React from "react";
import { Accordion } from "flowbite-react";
import { HelpCircle } from "lucide-react";
/**
 * @brief FAQ component
 * @details Renders a list of frequently asked questions and their answers
 *          using an accordion layout for better user experience
 *
 * @returns React component containing FAQ section
 */

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Foire aux questions</h1>
          <p className="text-gray-600">
            Trouvez les réponses aux questions les plus fréquemment posées sur
            notre plateforme.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <Accordion collapseAll>
            {/* General */}
            <Accordion.Panel>
              <Accordion.Title className="focus:ring-0">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Comment créer un compte ?</span>
                </div>
              </Accordion.Title>
              <Accordion.Content>
                <p className="text-gray-600">
                  Pour créer un compte, cliquez sur le bouton
                  &quote;Inscription&quote; dans le menu principal. Remplissez
                  le formulaire avec votre adresse email et choisissez un mot de
                  passe sécurisé. Une fois inscrit, vous pourrez accéder à
                  toutes les fonctionnalités de la plateforme.
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            <Accordion.Panel>
              <Accordion.Title className="focus:ring-0">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Comment créer un événement ?</span>
                </div>
              </Accordion.Title>
              <Accordion.Content>
                <p className="text-gray-600">
                  Pour créer un événement, vous devez d&apos;abord être connecté
                  à votre compte. Ensuite, cliquez sur le bouton &quote;Créer un
                  événement&quote; dans le menu principal ou sur votre tableau
                  de bord. Remplissez le formulaire avec les détails de votre
                  événement (titre, date, lieu, description, etc.) et ajoutez
                  des images si vous le souhaitez.
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            {/* Event */}
            <Accordion.Panel>
              <Accordion.Title className="focus:ring-0">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Comment modifier ou supprimer un événement ?</span>
                </div>
              </Accordion.Title>
              <Accordion.Content>
                <p className="text-gray-600">
                  Vous pouvez gérer vos événements depuis la section &quote;Mes
                  événements&quote;. Pour chaque événement, vous trouverez des
                  options pour le modifier ou le supprimer. Seul le créateur de
                  l&apos;événement peut effectuer ces actions.
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            <Accordion.Panel>
              <Accordion.Title className="focus:ring-0">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Comment créer un événement récurrent ?</span>
                </div>
              </Accordion.Title>
              <Accordion.Content>
                <p className="text-gray-600">
                  Lors de la création d&apos;un événement, cochez l&apos;option
                  &quote;vénement récurrent&quote;. Vous pourrez alors
                  sélectionner les jours de la semaine où l&apos;événement se
                  répète et définir une date de fin optionnelle. Cette
                  fonctionnalité est idéale pour les événements qui se répètent
                  régulièrement.
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            {/* Account */}
            <Accordion.Panel>
              <Accordion.Title className="focus:ring-0">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>J&apos;ai oublié mon mot de passe, que faire ?</span>
                </div>
              </Accordion.Title>
              <Accordion.Content>
                <p className="text-gray-600">
                  Si vous avez oublié votre mot de passe, cliquez sur &quote;Mot
                  de passe oublié ?&quote; sur la page de connexion. Entrez
                  votre adresse email et nous vous enverrons un lien pour
                  réinitialiser votre mot de passe. Vérifiez votre boîte de
                  réception et suivez les instructions.
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            {/* Privacy */}
            <Accordion.Panel>
              <Accordion.Title className="focus:ring-0">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Comment sont gérées mes données personnelles ?</span>
                </div>
              </Accordion.Title>
              <Accordion.Content>
                <p className="text-gray-600">
                  Vos informations personnelles sont stockées de manière
                  sécurisée et ne sont jamais partagées avec des tiers sans
                  votre consentement. Pour plus de détails, consultez notre
                  politique de confidentialité.
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            {/* Support */}
            <Accordion.Panel>
              <Accordion.Title className="focus:ring-0">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Comment contacter le support ?</span>
                </div>
              </Accordion.Title>
              <Accordion.Content>
                <p className="text-gray-600">
                  Pour toute question ou problème technique, vous pouvez nous
                  contacter via le formulaire de contact disponible sur la page
                  &quote;Contact&quote;. Notre équipe s&apos;efforcera de vous
                  répondre dans les plus brefs délais. Vous pouvez également
                  consulter notre documentation en ligne pour trouver des
                  réponses à vos questions.
                </p>
              </Accordion.Content>
            </Accordion.Panel>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
