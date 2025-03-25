"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { createBooking } from "@/lib/db/cinema";
import {
  MapPin,
  CreditCard,
  ShoppingCart,
  AlertCircle,
  Check,
  Trash2,
} from "lucide-react";
import { Alert } from "flowbite-react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";

interface AddressFeature {
  properties: {
    label: string;
    postcode: string;
    city: string;
    housenumber?: string;
    street: string;
  };
}

export default function CinemaCart() {
  const { user } = useAuth();
  const {
    items: cartItems,
    removeItem,
    clearCart,
    getTotalAmount,
    getRoomNumber,
  } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // États pour l'adresse
  const [addressInput, setAddressInput] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressFeature[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // États pour le paiement
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const searchAddress = async (query: string) => {
    if (!query.trim()) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          query,
        )}&limit=5`,
      );
      const data = await response.json();
      setAddressSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse:", error);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    searchAddress(value);
  };

  const handleAddressSelect = (feature: AddressFeature) => {
    const {
      label,
      postcode,
      city,
      housenumber,
      street: streetName,
    } = feature.properties;
    setAddressInput(label);
    setStreetNumber(housenumber || "");
    setStreet(streetName);
    setCity(city);
    setPostalCode(postcode);
    setShowSuggestions(false);
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(" ").substr(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) {
      return `${numbers.substr(0, 2)}/${numbers.substr(2, 2)}`;
    }
    return numbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Vérifications
      if (!streetNumber || !street || !city || !postalCode) {
        throw new Error("Veuillez remplir tous les champs de l'adresse");
      }

      if (!cardNumber || !expiryDate || !cvv || !cardName) {
        throw new Error("Veuillez remplir tous les champs de paiement");
      }

      const bookingsByRoom = cartItems.reduce(
        (acc, item) => {
          if (!acc[item.roomId]) {
            acc[item.roomId] = [];
          }
          acc[item.roomId].push(item);
          return acc;
        },
        {} as Record<string, typeof cartItems>,
      );

      // create booking for each room
      for (const [roomId, items] of Object.entries(bookingsByRoom)) {
        const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

        await createBooking({
          userId: user.uid,
          roomId,
          movieId: items[0].movieId,
          seats: items.map((item) => ({
            seatId: item.seatId,
            ticketType: item.ticketType,
            price: item.price,
          })),
          totalAmount,
          status: "confirmed",
        });
      }

      clearCart();
      setSuccess(true);
    } catch (err) {
      console.error("Erreur lors de la réservation:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Vous devez être connecté pour accéder au panier
            </h2>
            <Link href="/login" className="text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Réservation confirmée !</h2>
            <p className="text-gray-600 mb-6">
              Votre réservation a été effectuée avec succès. Vous recevrez un
              email de confirmation.
            </p>
            <Link
              href="/cinema"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retour au cinéma
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Votre panier est vide
            </h2>
            <Link
              href="/cinema"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Voir les films
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Panier</h1>

        {error && (
          <Alert color="failure" className="mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-8">
            {/* Adress */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Adresse
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rechercher une adresse
                  </label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={handleAddressChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Commencez à taper une adresse..."
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((feature, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                          onClick={() => handleAddressSelect(feature)}
                        >
                          {feature.properties.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro
                    </label>
                    <input
                      type="text"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Ex: 12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rue
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Nom de la rue"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Ville"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Code postal"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Paiement
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d&apos;expiration
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) =>
                        setExpiryDate(formatExpiryDate(e.target.value))
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").substr(0, 3))
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="123"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="JOHN DOE"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Récapitulatif
            </h2>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center group"
                >
                  <div className="flex-1">
                    <span className="block">
                      Siège {item.seatId} - {item.ticketType}
                    </span>
                    <span className="text-sm text-gray-500">
                      Salle {getRoomNumber(item.roomId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">
                      {item.price.toFixed(2)} €
                    </span>
                    <button
                      onClick={() => removeItem(item.seatId, item.roomId)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>{getTotalAmount().toFixed(2)} €</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? "Paiement en cours..." : "Payer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
