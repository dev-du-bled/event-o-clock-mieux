import ContactForm from "@/components/about/contact-form";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-gray-600">
            Une question ? Un problème ? N&apos;hésitez pas à nous contacter.
            Notre équipe est là pour vous aider et répondra à votre message dans
            les plus brefs délais.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
