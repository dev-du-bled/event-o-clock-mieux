/**
 * @file page.tsx
 * @brief Event editing page component
 * @details Provides functionality to edit existing events including form handling,
 *          image management, and address validation
 */

import EventForm from "@/components/events/event-form/EventForm";
import { getUser } from "@/server/util/getUser";
import { EventDataType, getEventById } from "@/lib/db/events";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function EditEvent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();

  // get id param
  const id = (await params).id;

  const event = await getEventById(id);

  if (!event) {
    redirect("/not-found");
  }

  // Vérification des permissions (créateur ou permission update)
  const result = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permission: { event: ["update"] },
    },
  });

  if (!result.success && event.createdBy !== user.id) {
    redirect("/forbidden");
  }

  const data: EventDataType = {
    address: event.address,
    title: event.title,
    startDate: event.startDate,
    startTime: event.startTime,
    endDate: event.endDate,
    endTime: event.endTime,
    description: event.description,
    place: event.place,
    city: event.city,
    postalCode: event.postalCode,
    prices: event.prices,
    images: event.images,
    categories: event.categories,
    isPaid: event.isPaid,
    organizerWebsite: event.organizerWebsite,
    organizerPhone: event.organizerPhone,
    createdBy: event.createdBy,
    status: event.status,
    isRecurring: event.isRecurring,
    recurringDays: event.recurringDays,
    recurringEndDate: event.recurringEndDate,
    isAccessible: event.isAccessible,
    hasParking: event.hasParking,
    hasPublicTransport: event.hasPublicTransport,
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Modifier un événement</h1>
        <EventForm type="update" eventData={data} eventId={id} />
      </div>
    </div>
  );
}
