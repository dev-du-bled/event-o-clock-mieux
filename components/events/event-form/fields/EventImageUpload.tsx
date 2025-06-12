"use client";

import React from "react";
import Image from "next/image";
import { Upload } from "lucide-react";

interface EventImageUploadProps {
  images: File[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  removeImage: (index: number) => void;
}

const EventImageUpload: React.FC<EventImageUploadProps> = ({
  images,
  handleImageChange,
  handleDrop,
  handleDragOver,
  removeImage,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Upload className="inline-block w-4 h-4 mr-2" />
        Images (max 5)
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="images"
        />
        <label htmlFor="images" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Cliquez pour sélectionner ou glissez-déposez vos images ici
          </p>
        </label>
      </div>
      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <Image
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                width={100}
                height={100}
                className="h-20 w-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs leading-none hover:bg-red-600"
                aria-label={`Supprimer l\'image ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Note: Zod ne valide pas directement les fichiers ici, mais on pourrait ajouter une validation sur images.length si besoin */}
    </div>
  );
};

export default EventImageUpload;
