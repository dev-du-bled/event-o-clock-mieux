"use client";

import React, { useState } from "react";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert } from "flowbite-react";
import { submitContactForm } from "@/lib/db/contact";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await submitContactForm(formData);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(
        "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
      );
      console.error("Erreur lors de l'envoi du formulaire:", err);
    } finally {
      setLoading(false);
    }
  };

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
          {error && (
            <Alert color="failure" className="mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </Alert>
          )}

          {success && (
            <Alert color="success" className="mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Votre message a été envoyé avec succès ! Nous vous répondrons
                  dans les plus brefs délais.
                </span>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="john@exemple.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sujet *
              </label>
              <input
                type="text"
                id="subject"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Comment pouvons-nous vous aider ?"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message *
              </label>
              <textarea
                id="message"
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Écrivez votre message ici..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer le message
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
