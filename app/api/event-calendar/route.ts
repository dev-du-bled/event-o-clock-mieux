import { getEventById } from "@/lib/db/events";
import { generateICS } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("id");

  if (!eventId) {
    return new Response("Event ID is required", { status: 400 });
  }

  const event = await getEventById(eventId);
  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const calendar = generateICS(
    event,
    `${req.nextUrl.origin}/events/${eventId}`
  );

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="${event.title.replace(/\s+/g, "-").toLowerCase()}.ics"`,
    },
  });
}
