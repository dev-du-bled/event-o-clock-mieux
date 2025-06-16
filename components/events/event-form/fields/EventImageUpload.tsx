"use client";

import React from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

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
      <label className="flex items-center gap-2 mb-2">
        <Upload className="w-4 h-4" />
        Images (max 5)
      </label>
      <label htmlFor="images" className="cursor-pointer">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-accent border-primary group"
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="images"
          />
          <Upload className="mx-auto h-12 w-12 group-hover:text-accent" />
          <p className="mt-2 text-sm group-hover:text-accent">
            Cliquez pour sélectionner ou glissez-déposez vos images ici
          </p>
        </div>
      </label>
      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <Image
                src={URL.createObjectURL(image)}
                alt={`Preview ${index}`}
                width={100}
                height={100}
                className="h-20 w-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:cursor-pointer"
                aria-label={`Supprimer l'image ${index + 1}`}
              >
                <X size={12} />
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
