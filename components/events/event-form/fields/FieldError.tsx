"use client";

import { AlertCircle } from "lucide-react";
import React from "react";

interface FieldErrorDisplayProps {
  error?: string;
}

const FieldErrorDisplay: React.FC<FieldErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  return (
    <div className="mt-1 flex items-center text-sm text-destructive">
      <AlertCircle className="mr-1 h-4 w-4" />
      {error}
    </div>
  );
};

export default FieldErrorDisplay;
