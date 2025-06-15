"use client";

import { auth } from "@/lib/auth/auth";
import { authClient } from "@/lib/auth/auth-client";
import { uploadProfileImage } from "@/lib/storage";
import { User, Camera } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface EditProfileProps {
  user: typeof auth.$Infer.Session.user;
}

export default function EditProfile({ user }: EditProfileProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.image || null
  );
  const [displayName, setDisplayName] = useState(user?.name || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let photoURL = user.image || "";

      if (newImage) {
        photoURL = await uploadProfileImage(newImage, user.id);
      }

      await authClient.updateUser({
        image: photoURL,
        name: displayName,
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError("Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4 p-4">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* profile picture */}
      <div className="text-center">
        <div
          onClick={handleImageClick}
          className="relative inline-block cursor-pointer group rounded-full"
        >
          {imagePreview ? (
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto">
              <Image
                src={imagePreview}
                alt="Photo de profil"
                className="w-full h-full object-cover"
                height={128}
                width={128}
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Cliquez pour modifier votre photo de profil
        </p>
      </div>

      {/* display name */}
      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Nom d&apos;affichage
        </label>
        <input
          type="text"
          id="displayName"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="Votre nom d'affichage"
        />
      </div>

      {/* Email  */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email
        </label>
        <input
          type="email"
          value={user.email || ""}
          disabled
          className="w-full rounded-lg border border-input px-4 py-2 bg-muted text-muted-foreground"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Mise à jour..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
