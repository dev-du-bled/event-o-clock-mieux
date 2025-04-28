import { Event } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * A utility function to combine class names conditionally and merge conflicting Tailwind CSS classes.
 *
 * @param inputs - A list of class names or conditions that determine which classes should be applied.
 * @returns A string of merged and conditionally applied class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(event: Event) {
  if (event.isRecurring) {
    const days = event.recurringDays.map(day => {
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
}

export function formatEventTime(event: Event) {
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
}
