import React from "react";
import CreateEventForm from "@/components/events/create-event/CreateEventForm";

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Créer un événement</h1>
        <CreateEventForm />
      </div>
    </div>
  );
}
