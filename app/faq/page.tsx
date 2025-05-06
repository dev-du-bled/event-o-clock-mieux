/**
 * @file page.tsx
 * @brief FAQ page component
 * @details Displays frequently asked questions in an accordion format
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
          <Accordion type="single" collapsible>
            {/* General */}
            <AccordionItem value="general">
              <AccordionTrigger>Comment créer un compte ?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Pour créer un compte, cliquez sur le bouton
                &quot;Inscription&quot; dans le menu principal. Remplissez le
                formulaire avec votre adresse email et choisissez un mot de
                passe sécurisé. Une fois inscrit, vous pourrez accéder à toutes
                les fonctionnalités de la plateforme.
              </AccordionContent>
            </AccordionItem>

            {/* Event */}
            <AccordionItem value="create-event">
              <AccordionTrigger>Comment créer un événement ?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Pour créer un événement, vous devez d&apos;abord être connecté à
                votre compte. Ensuite, cliquez sur le bouton &quot;Créer un
                événement&quot; dans le menu principal ou sur votre tableau de
                bord. Remplissez le formulaire avec les détails de votre
                événement (titre, date, lieu, description, etc.) et ajoutez des
                images si vous le souhaitez.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="edit-delete-event">
              <AccordionTrigger>
                Comment modifier ou supprimer un événement ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Vous pouvez gérer vos événements depuis la section &quot;Mes
                événements&quot;. Pour chaque événement, vous trouverez des
                options pour le modifier ou le supprimer. Seul le créateur de
                l&apos;événement peut effectuer ces actions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="recurring-event">
              <AccordionTrigger>
                Comment créer un événement récurrent ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Lors de la création d&apos;un événement, cochez l&apos;option
                &quot;vénement récurrent&quot;. Vous pourrez alors sélectionner
                les jours de la semaine où l&apos;événement se répète et définir
                une date de fin optionnelle. Cette fonctionnalité est idéale
                pour les événements qui se répètent régulièrement.
              </AccordionContent>
            </AccordionItem>

            {/* Account */}
            <AccordionItem value="forgot-passwd">
              <AccordionTrigger>
                J&apos;ai oublié mon mot de passe, que faire ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Si vous avez oublié votre mot de passe, cliquez sur &quot;Mot de
                passe oublié ?&quot; sur la page de connexion. Entrez votre
                adresse email et nous vous enverrons un lien pour réinitialiser
                votre mot de passe. Vérifiez votre boîte de réception et suivez
                les instructions.
              </AccordionContent>
            </AccordionItem>

            {/* Privacy */}
            <AccordionItem value="personnal-data">
              <AccordionTrigger>
                Comment sont gérées mes données personnelles ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Vos informations personnelles sont stockées de manière sécurisée
                et ne sont jamais partagées avec des tiers sans votre
                consentement. Pour plus de détails, consultez notre politique de
                confidentialité.
              </AccordionContent>
            </AccordionItem>

            {/* Support */}
            <AccordionItem value="contact-support">
              <AccordionTrigger>
                Comment contacter le support ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Pour toute question ou problème technique, vous pouvez nous
                contacter via le formulaire de contact disponible sur la page
                &quot;Contact&quot;. Notre équipe s&apos;efforcera de vous
                répondre dans les plus brefs délais. Vous pouvez également
                consulter notre documentation en ligne pour trouver des réponses
                à vos questions.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
