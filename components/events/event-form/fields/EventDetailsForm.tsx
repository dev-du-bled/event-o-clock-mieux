"use client";

import React from "react";
import { Tag } from "lucide-react";
import FieldErrorDisplay from "./FieldError";

interface EventDetailsFormProps {
  titleValue: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  titleError?: string;

  descriptionValue: string;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  descriptionError?: string;

  allCategories: string[];
  selectedCategories: string[];
  onSelectedCategoriesChange: (categories: string[]) => void;
  categoriesError?: string;
  onClearCategoriesError: () => void;
}

const EventDetailsForm: React.FC<EventDetailsFormProps> = ({
  titleValue,
  onTitleChange,
  titleError,
  descriptionValue,
  onDescriptionChange,
  descriptionError,
  allCategories,
  selectedCategories,
  onSelectedCategoriesChange,
  categoriesError,
  onClearCategoriesError,
}) => {
  return (
    <>
      {/* Title Input */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Titre de l&apos;événement *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={titleValue}
          onChange={onTitleChange}
          className={`w-full rounded-lg border ${
            titleError ? "border-red-500" : "border-gray-300"
          } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
          placeholder="Ex: Concert de Jazz au Parc"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? "title-error" : undefined}
        />
        <div id="title-error">
          <FieldErrorDisplay error={titleError} />
        </div>
      </div>

      {/* Description Input */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description détaillée *
        </label>
        <textarea
          id="description"
          name="description"
          required
          value={descriptionValue}
          onChange={onDescriptionChange}
          rows={5}
          className={`w-full rounded-lg border ${
            descriptionError ? "border-red-500" : "border-gray-300"
          } px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`}
          placeholder="Décrivez votre événement en détail..."
          aria-invalid={!!descriptionError}
          aria-describedby={descriptionError ? "description-error" : undefined}
        />
        <div id="description-error">
          <FieldErrorDisplay error={descriptionError} />
        </div>
      </div>

      {/* Categories Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="inline-block w-4 h-4 mr-2" />
          Catégories *
        </label>
        <div className="flex flex-wrap gap-2">
          {allCategories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => {
                let updatedCategories: string[];
                if (selectedCategories.includes(category)) {
                  updatedCategories = selectedCategories.filter(
                    c => c !== category
                  );
                } else {
                  updatedCategories = [...selectedCategories, category];
                }
                onSelectedCategoriesChange(updatedCategories);
                if (updatedCategories.length > 0) {
                  onClearCategoriesError();
                }
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategories.includes(category)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${
                categoriesError && selectedCategories.length === 0
                  ? "ring-2 ring-offset-1 ring-red-500"
                  : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <FieldErrorDisplay
          error={
            categoriesError && selectedCategories.length === 0
              ? categoriesError
              : undefined
          }
        />
      </div>
    </>
  );
};

export default EventDetailsForm;
