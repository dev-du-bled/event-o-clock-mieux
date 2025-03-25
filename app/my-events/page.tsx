"use client";
/**
 * @file page.tsx
 * @brief User events management page component
 * @details Handles displaying, editing and deleting user's created events
 */
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getUserEvents, deleteEvent, type Event } from "@/lib/db/events";
import {
  Calendar,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Repeat,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Modal } from "flowbite-react";
import Image from "next/image";

/**
 * @brief User events management component
 * @details Main component for managing user-created events. Features include:
 *          - Displaying user's created events
 *          - Event deletion functionality
 *          - Event editing navigation
 *          - Loading and error states handling
 *          - Confirmation modals for destructive actions
 *
 * @returns React component for user events management page
 */

export default function MyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      if (!user) return;

      try {
        const userEvents = await getUserEvents(user.uid);
        setEvents(userEvents);
      } catch (err) {
        setError("Erreur lors du chargement des événements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [user]);

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent?.id) return;

    setDeleteLoading(true);
    try {
      await deleteEvent(selectedEvent.id);
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setDeleteModal(false);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de l'événement");
    } finally {
      setDeleteLoading(false);
      setSelectedEvent(null);
    }
  };

  const formatEventDate = (event: Event) => {
    if (event.isRecurring) {
      const days = event.recurringDays.map((day) => {
        switch (day) {
          case "monday":
            return "Lundi";
          case "tuesday":
            return "Mardi";
          case "wednesday":
            return "Mercredi";
          case "thursday":
            return "Jeudi";
          case "friday":
            return "Vendredi";
          case "saturday":
            return "Samedi";
          case "sunday":
            return "Dimanche";
          default:
            return "";
        }
      });
      return `Tous les ${days.join(", ")}`;
    }

    try {
      const startDate = format(new Date(event.startDate), "PPP", {
        locale: fr,
      });
      const endDate = format(new Date(event.endDate), "PPP", { locale: fr });

      if (startDate === endDate) {
        return startDate;
      }
      return `Du ${startDate} au ${endDate}`;
    } catch {
      return "Date non définie";
    }
  };

  const formatEventTime = (event: Event) => {
    if (!event.startTime || !event.endTime) {
      return "Horaire non défini";
    }

    try {
      const startTime = format(
        new Date(`2000-01-01T${event.startTime}`),
        "HH:mm"
      );
      const endTime = format(new Date(`2000-01-01T${event.endTime}`), "HH:mm");
      return `${startTime} - ${endTime}`;
    } catch {
      return "Horaire non défini";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Vous devez être connecté pour voir vos événements
            </h2>
            <Link href="/login" className="text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes événements</h1>
          <Link
            href="/create-event"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Créer un événement
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Vous n&apos;avez pas encore créé d&apos;événements
            </h2>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre premier événement !
            </p>
            <Link
              href="/create-event"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Créer un événement
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {event.images && event.images[0] && (
                  <div className="relative h-48">
                    <Image
                      src={event.images[0]}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>

                  <div className="space-y-2 text-gray-600 mb-4">
                    <div className="flex items-center">
                      {event.isRecurring ? (
                        <Repeat className="w-4 h-4 mr-2" />
                      ) : (
                        <Calendar className="w-4 h-4 mr-2" />
                      )}
                      <span>{formatEventDate(event)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatEventTime(event)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      {event.isPaid ? `${event.price} €` : "Gratuit"}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        href={`/edit-event/${event.id}`}
                        className="p-2 text-gray-600 hover:text-primary transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(event)}
                        className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete confirmation modal dialog */}
        <Modal
          show={deleteModal}
          onClose={() => {
            setDeleteModal(false);
            setSelectedEvent(null);
          }}
          size="md"
        >
          <Modal.Header>
            <div className="text-xl font-semibold">
              Confirmer la suppression
            </div>
          </Modal.Header>
          <Modal.Body>
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer l&apos;événement `&quot;`
              {selectedEvent?.title}`&quot;` ? Cette action est irréversible.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
