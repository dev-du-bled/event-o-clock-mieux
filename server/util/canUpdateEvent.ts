import prisma from "@/lib/prisma";
import { checkEventPermission } from "@/server/actions/events";
import { getUser } from "@/server/util/getUser";

export async function canUpdateEvent(eventId: string) {
  const user = await getUser(false);

  if (!user) {
    return false;
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return false;
  }

  const canUpdate =
    (await checkEventPermission("override")) ||
    ((await checkEventPermission("update")) && user.id === event.createdBy);

  return canUpdate;
}
