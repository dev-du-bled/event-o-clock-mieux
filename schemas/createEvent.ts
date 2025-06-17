import { z } from "zod";

const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const frenchPostalCodeRegex = /^\d{5}$/;

const validWeekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const priceSchema = z.object({
  type: z.string().trim().min(1, { message: "Le type est requis" }),
  price: z
    .number({ message: "Le prix doit être un nombre" })
    .min(0.9, { message: "Le prix doit etre supérieur à 1" }),
});

export type Price = z.infer<typeof priceSchema>;

export const createEventSchema = z
  .object({
    title: z.string().trim().min(1, { message: "Le titre est requis" }),

    startDate: z
      .string()
      .regex(dateRegex, "Format de date invalide (AAAA-MM-JJ)")
      .optional()
      .or(z.literal("")),
    endDate: z
      .string()
      .regex(dateRegex, "Format de date invalide (AAAA-MM-JJ)")
      .optional()
      .or(z.literal("")),

    startTime: z.string().regex(timeRegex, "Format d'heure invalide (HH:MM)"),
    endTime: z.string().regex(timeRegex, "Format d'heure invalide (HH:MM)"),

    place: z.string().trim().min(1, { message: "Le lieu est requis" }),
    address: z.string().trim().min(1, { message: "L'adresse est requise" }),
    city: z.string().trim().min(1, { message: "La ville est requise" }),
    postalCode: z
      .string()
      .regex(frenchPostalCodeRegex, "Code postal invalide (5 chiffres)"),

    description: z
      .string()
      .trim()
      .min(10, { message: "La description doit faire au moins 10 caractères" }),

    categories: z
      .array(z.string())
      .min(1, { message: "Sélectionnez au moins une catégorie" }),

    isAccessible: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasPublicTransport: z.boolean().default(false),

    isPaid: z.boolean(),
    prices: z.array(priceSchema).default([]),

    isRecurring: z.boolean(),
    recurringDays: z.array(z.enum(validWeekDays)).optional().default([]),

    organizerWebsite: z
      .string()
      .url({ message: "URL du site web invalide" })
      .optional()
      .or(z.literal("")),
    organizerPhone: z
      .string()
      .regex(/^[\d\s()+-]*$/, {
        message: "Numéro de téléphone invalide",
      })
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.isPaid) {
      if (!data.prices || data.prices.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Au moins un prix est requis pour un événement payant",
          path: ["prices"],
        });
      }

      data.prices.forEach((price, index) => {
        const result = priceSchema.safeParse(price);
        if (!result.success) {
          result.error.issues.forEach(issue => {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: issue.message,
              path: ["prices", index, ...(issue.path || [])],
            });
          });
        }
      });
    }

    if (data.isRecurring) {
      if (!data.recurringDays || data.recurringDays.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sélectionnez au moins un jour pour un événement récurrent",
          path: ["recurringDays"],
        });
      }
      if (data.startTime && data.endTime && data.endTime <= data.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "L'heure de fin doit être après l'heure de début",
          path: ["endTime"],
        });
      }
    } else {
      let startDateTime: Date | null = null;
      let endDateTime: Date | null = null;

      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date de début requise",
          path: ["startDate"],
        });
      }
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date de fin requise",
          path: ["endDate"],
        });
      }

      if (
        data.startDate &&
        dateRegex.test(data.startDate) &&
        data.endDate &&
        dateRegex.test(data.endDate) &&
        data.startTime &&
        timeRegex.test(data.startTime) &&
        data.endTime &&
        timeRegex.test(data.endTime)
      ) {
        try {
          startDateTime = new Date(`${data.startDate}T${data.startTime}:00`);
          endDateTime = new Date(`${data.endDate}T${data.endTime}:00`);

          if (isNaN(startDateTime.getTime())) {
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_date,
              message: "Date/heure de début invalide",
              path: ["startDate"],
            });
          }
          if (isNaN(endDateTime.getTime())) {
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_date,
              message: "Date/heure de fin invalide",
              path: ["endDate"],
            });
          }

          if (
            startDateTime &&
            endDateTime &&
            !isNaN(startDateTime.getTime()) &&
            !isNaN(endDateTime.getTime()) &&
            endDateTime <= startDateTime
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "La fin doit être après le début",
              path: ["endDate"],
            });
          }
        } catch (e) {
          console.error("Erreur création Date dans Zod:", e);
        }
      }
    }
  });

export type CreateEventFormData = z.infer<typeof createEventSchema>;
