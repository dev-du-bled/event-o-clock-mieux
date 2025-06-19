import { Event } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AddressData } from "@/types/types";
import { validWeekDays } from "@/schemas/createEvent";

/**
 * A utility function to combine class names conditionally and merge conflicting Tailwind CSS classes.
 *
 * @param inputs - A list of class names or conditions that determine which classes should be applied.
 * @returns A string of merged and conditionally applied class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format the event date to a readable format in French
 *
 * @param event - The event to format
 * @returns The formatted event date
 */
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

/**
 * Format the event time to a readable format in French
 *
 * @param event - The event to format
 * @returns The formatted event time
 */
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

/**
 * Search for an address using the API-Adresse Data Gouv API
 *
 * @param query - The query to search for
 * @param setAddressSuggestions - The function to set the address suggestions
 * @param setShowSuggestions - The function to set the show suggestions
 */
export const searchAddress = async (
  query: string,
  setAddressSuggestions: (suggestions: AddressData[]) => void,
  setShowSuggestions: (show: boolean) => void
) => {
  if (!query.trim()) {
    setAddressSuggestions([]);
    setShowSuggestions(false);
    return;
  }

  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        query
      )}&limit=5`
    );
    const data = await response.json();

    setAddressSuggestions(data.features || []);
    setShowSuggestions(true);
  } catch (error) {
    console.error("Erreur lors de la recherche d'adresse:", error);
  }
};

/**
 * Convert a base 64 image string to File object
 * @param fileString the bae 64 string image
 * @param fileName the File name
 * @returns the File from base 64 string
 */
export async function Base64ToFile(
  fileString: string,
  fileName: string
): Promise<File> {
  const data = await fetch(fileString);

  const blob = await data.blob();

  return new File([blob], fileName, { type: "image/webp" });
}

// Convertir les images en base64
// marche seulement dans le navigateur
export async function FileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Generate an ICS file  for an event
 * @param event The event to generate the ICS file for
 * @param url The URL to the event page
 * @returns string of the ICS file content
 */
export function generateICS(event: Event, eventURl: string): string {
  let recurringDaysRule = "";
  let firstDayString = "";

  // generate the recurring days rule if the event is recurring
  if (event.isRecurring) {
    // add days ot the rule string like "MO", "TU", "WE", "TH", "FR", "SA", "SU"
    recurringDaysRule = `RRULE:FREQ=WEEKLY;BYDAY=${event.recurringDays.map(
      day => {
        return day.slice(0, 2).toUpperCase();
      }
    )};`;

    const dayIndex = validWeekDays.indexOf(
      event.recurringDays[0] as (typeof validWeekDays)[number]
    );

    // set the nextDay to the next occurrence of the first recurring day

    const today = new Date();
    const currentDayIndex = today.getDay();
    const fixCurrentDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1; // sunday = 0 set it to 7 to be monday = 0
    const daysUntilNext = (dayIndex - fixCurrentDayIndex + 7) % 7;

    firstDayString = format(
      new Date().setDate(today.getDate() + daysUntilNext),
      "yyyy-MM-dd"
    );
  }

  const titleFormated = event.title.replace(/\s+/g, "-").toLowerCase();

  const dtstamp =
    new Date(event.createdAt).toISOString().replace(/[-:]/g, "").slice(0, -5) +
    "Z";

  const startTime = event.isRecurring
    ? new Date(`${firstDayString}T${event.startTime}`)
        .toISOString()
        .replace(/[-:]/g, "")
        .slice(0, -5) + "Z"
    : new Date(`${event.startDate}T${event.startTime}`)
        .toISOString()
        .replace(/[-:]/g, "")
        .slice(0, -5) + "Z";

  const endTime = event.isRecurring
    ? new Date(`${firstDayString}T${event.endTime}`)
        .toISOString()
        .replace(/[-:]/g, "")
        .slice(0, -5) + "Z"
    : new Date(`${event.endDate}T${event.endTime}`)
        .toISOString()
        .replace(/[-:]/g, "")
        .slice(0, -5) + "Z";

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:event-o-clock

BEGIN:VEVENT
UID:${titleFormated}@event-o-clock
DTSTAMP:${dtstamp}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${`${event.place} ${event.address} ${event.city} ${event.postalCode}` || "Lieu non spécifié"}
URL:${eventURl}
${event.isRecurring ? recurringDaysRule : ""}

END:VEVENT

END:VCALENDAR`;
}
