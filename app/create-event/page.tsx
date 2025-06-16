import React from "react";
import EventForm from "@/components/events/event-form/EventForm";
import { EventStatus } from "@prisma/client";
import { EventDataType } from "@/lib/db/events";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const data: EventDataType = {
  address: "",
  title: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  description: "",
  place: "",
  city: "",
  postalCode: "",
  prices: [],
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

export default async function CreateEventPage() {
  // Vérification des permissions avec Better Auth
  const result = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permission: { event: ["create"] },
    },
  });

  if (!result.success) {
    redirect("/forbidden");
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Créer un événement</h1>
        <EventForm type="create" eventData={data} />
      </div>
    </div>
  );
}
