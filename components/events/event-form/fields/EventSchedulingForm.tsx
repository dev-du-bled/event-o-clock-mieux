"use client";

import React from "react";
import { Clock, Repeat } from "lucide-react";
import FieldErrorDisplay from "./FieldError";
import { CreateEventFormData as ZodFormData } from "@/schemas/createEvent";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface EventSchedulingFormProps {
  // Recurrence props
  isRecurring: boolean;
  setIsRecurring: (isRecurring: boolean) => void;
  recurringDays: ZodFormData["recurringDays"];
  setRecurringDays: (days: ZodFormData["recurringDays"]) => void;
  weekDays: { id: ZodFormData["recurringDays"][number]; label: string }[];

  // Specific Date/Time props (used for both recurring and non-recurring times, and non-recurring dates)
  startDate: string; // For non-recurring
  setStartDate: (date: string) => void; // For non-recurring
  endDate: string; // For non-recurring
  setEndDate: (date: string) => void; // For non-recurring
  startTime: string; // For both
  setStartTime: (time: string) => void; // For both
  endTime: string; // For both
  setEndTime: (time: string) => void; // For both

  // Error props
  formErrors: {
    recurringDays?: string[];
    startDate?: string[];
    startTime?: string[];
    endDate?: string[];
    endTime?: string[];
  };
  clearDateErrors: () => void;
  clearTimeErrors: () => void;
}

const EventSchedulingForm: React.FC<EventSchedulingFormProps> = ({
  isRecurring,
  setIsRecurring,
  recurringDays,
  setRecurringDays,
  weekDays,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  formErrors,
  clearDateErrors,
  clearTimeErrors,
}) => {
  return (
    <>
      {/* Recurrence Checkbox & Conditional Fields */}
      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={isRecurring}
            onCheckedChange={e => setIsRecurring(e as boolean)}
          />
          <Repeat className="h-4 w-4" />
          Événement récurrent
        </label>

        {isRecurring && (
          <div className="space-y-4 pl-6 border-l-2 border-primary ml-2">
            <div>
              <label className="text-sm font-medium mb-2">
                Jours de la semaine *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {weekDays.map(day => (
                  <label key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={recurringDays.includes(day.id)}
                      onCheckedChange={e => {
                        let updatedDays: ZodFormData["recurringDays"];
                        if (e) {
                          updatedDays = [...recurringDays, day.id];
                        } else {
                          updatedDays = recurringDays.filter(d => d !== day.id);
                        }
                        setRecurringDays(updatedDays);
                      }}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
              <FieldErrorDisplay error={formErrors.recurringDays?.[0]} />
            </div>

            {/* Time inputs for recurring events */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="recurringStartTime"
                  className="flex items-center gap-2 mb-2 text-sm"
                >
                  <Clock className="w-4 h-4" />
                  Heure de début *
                </label>
                <Input
                  id="recurringStartTime"
                  name="startTime" // Common name for Zod
                  type="time"
                  value={startTime}
                  onChange={e => {
                    setStartTime(e.target.value);
                    clearTimeErrors();
                  }}
                  className={formErrors.startTime && "border-destructive"}
                  aria-invalid={!!formErrors.startTime}
                  aria-describedby={
                    formErrors.startTime
                      ? "startTime-error-recurring"
                      : undefined
                  }
                />
                <div id="startTime-error-recurring">
                  <FieldErrorDisplay error={formErrors.startTime?.[0]} />
                </div>
              </div>
              <div>
                <label
                  htmlFor="recurringEndTime"
                  className="flex items-center gap-2 mb-2 text-sm"
                >
                  <Clock className="w-4 h-4" />
                  Heure de fin *
                </label>
                <Input
                  id="recurringEndTime"
                  name="endTime" // Common name for Zod
                  type="time"
                  value={endTime}
                  onChange={e => {
                    setEndTime(e.target.value);
                    clearTimeErrors();
                  }}
                  className={formErrors.endTime && "border-destructive"}
                  aria-invalid={!!formErrors.endTime}
                  aria-describedby={
                    formErrors.endTime ? "endTime-error-recurring" : undefined
                  }
                />
                <div id="endTime-error-recurring">
                  <FieldErrorDisplay error={formErrors.endTime?.[0]} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Specific Dates & Times (non-recurring) */}
      {!isRecurring && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date/Time */}
          <div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <Clock className="w-4 h-4" />
              Date et heure de début *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    clearDateErrors();
                  }}
                  className={formErrors.startDate && "border-destructive"}
                  aria-invalid={!!formErrors.startDate}
                  aria-describedby={
                    formErrors.startDate
                      ? "startDate-error-specific"
                      : undefined
                  }
                />
                <div id="startDate-error-specific">
                  <FieldErrorDisplay error={formErrors.startDate?.[0]} />
                </div>
              </div>
              <div>
                <Input
                  id="specificStartTime"
                  name="startTime" // Common name for Zod
                  type="time"
                  value={startTime}
                  onChange={e => {
                    setStartTime(e.target.value);
                    clearTimeErrors();
                    clearDateErrors(); // Also for chronology
                  }}
                  className={formErrors.startTime && "border-destructive"}
                  aria-invalid={!!formErrors.startTime}
                  aria-describedby={
                    formErrors.startTime
                      ? "startTime-error-specific"
                      : undefined
                  }
                />
                <div id="startTime-error-specific">
                  <FieldErrorDisplay error={formErrors.startTime?.[0]} />
                </div>
              </div>
            </div>
          </div>
          {/* End Date/Time */}
          <div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <Clock className="w-4 h-4" />
              Date et heure de fin *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={endDate}
                  onChange={e => {
                    setEndDate(e.target.value);
                    clearDateErrors();
                  }}
                  className={formErrors.endDate && "border-destructive"}
                  aria-invalid={!!formErrors.endDate}
                  aria-describedby={
                    formErrors.endDate ? "endDate-error-specific" : undefined
                  }
                />
                <div id="endDate-error-specific">
                  <FieldErrorDisplay error={formErrors.endDate?.[0]} />
                </div>
              </div>
              <div>
                <Input
                  id="specificEndTime"
                  name="endTime" // Common name for Zod
                  type="time"
                  value={endTime}
                  onChange={e => {
                    setEndTime(e.target.value);
                    clearTimeErrors();
                    clearDateErrors(); // Also for chronology
                  }}
                  className={formErrors.endTime && "border-destructive"}
                  aria-invalid={!!formErrors.endTime}
                  aria-describedby={
                    formErrors.endTime ? "endTime-error-specific" : undefined
                  }
                />
                <div id="endTime-error-specific">
                  <FieldErrorDisplay error={formErrors.endTime?.[0]} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventSchedulingForm;
