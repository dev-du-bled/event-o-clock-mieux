import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import FieldErrorDisplay from "./FieldError";

interface EventContactFormProps {
  // Contact info props
  organizerWebsite: string;
  setOrganizerWebsite: (website: string) => void;
  organizerPhone: string;
  setOrganizerPhone: (phone: string) => void;
  clearWebsiteError: () => void;
  clearPhoneError: () => void;

  // Error props
  formErrors: {
    organizerWebsite?: string[];
    organizerPhone?: string[];
  };
}

export default function EventContactForm({
  organizerWebsite,
  setOrganizerWebsite,
  organizerPhone,
  setOrganizerPhone,
  clearWebsiteError,
  clearPhoneError,
  formErrors,
}: EventContactFormProps) {
  return (
    <div className="mt-4">
      <label className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4" />
        Informations de contact
      </label>
      <div className="space-y-4">
        <div>
          <Input
            id="organizerWebsite"
            name="organizerWebsite"
            type="url"
            value={organizerWebsite}
            onChange={e => {
              setOrganizerWebsite(e.target.value);
              clearWebsiteError();
            }}
            className={formErrors.organizerWebsite && "border-destructive"}
            placeholder="Site web (ex: https://monsite.com)"
            aria-invalid={!!formErrors.organizerWebsite}
            aria-describedby={
              formErrors.organizerWebsite ? "organizerWebsite-error" : undefined
            }
          />
          <FieldErrorDisplay error={formErrors.organizerWebsite?.[0]} />
        </div>
        <div>
          <Input
            id="organizerPhone"
            name="organizerPhone"
            type="tel"
            value={organizerPhone}
            onChange={e => {
              setOrganizerPhone(e.target.value);
              clearPhoneError();
            }}
            className={formErrors.organizerPhone && "border-destructive"}
            placeholder="Numéro de téléphone"
            aria-invalid={!!formErrors.organizerPhone}
            aria-describedby={
              formErrors.organizerPhone ? "organizerPhone-error" : undefined
            }
          />
          <FieldErrorDisplay error={formErrors.organizerPhone?.[0]} />
        </div>
      </div>
    </div>
  );
}
