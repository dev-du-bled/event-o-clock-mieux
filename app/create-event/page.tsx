import React from "react";
import EventForm from "@/components/events/event-form/EventForm";
import { EventStatus } from "@prisma/client";
import { EventDataType } from "@/lib/db/events";

const data: EventDataType = {
  address: "",
  title: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  description: "",
  city: "",
  postalCode: "",
  price: 0,
  images: [],
  categories: [],
  isPaid: false,
  organizerWebsite: "",
  organizerPhone: "",
  createdBy: "",
  status: EventStatus.DRAFT,
  isRecurring: false,
  recurringDays: [],
  recurringEndDate: "",
  isAccessible: false,
  hasParking: false,
  hasPublicTransport: false,
};

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Créer un événement</h1>
        <EventForm type="create" eventData={data} />
      </div>
    </div>
  );
}
