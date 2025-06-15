/**
 * @file page.tsx
 * @brief Event editing page component
 * @details Provides functionality to edit existing events including form handling,
 *          image management, and address validation
 */

import NoAuth from "@/components/auth/no-auth";
import NotAuthorized from "@/components/auth/not-authorized";
import EventForm from "@/components/events/event-form/EventForm";
import { auth } from "@/lib/auth/auth";
import { EventDataType, getEventById } from "@/lib/db/events";
import { headers } from "next/headers";

export default async function EditEvent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  if (!user) return <NoAuth />;

  // get id param
  const id = (await params).id;

  const event = await getEventById(id);

  // check event is created by the user
  if (event?.createdBy !== user.id) return <NotAuthorized />;

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Créer un événement</h1>
        <EventForm type="update" eventData={data} eventId={id} />
      </div>
    </div>
  );
}
