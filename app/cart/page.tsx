"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  CreditCard,
  ShoppingCart,
  AlertCircle,
  Check,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { searchAddress } from "@/lib/utils";
import { AddressData } from "@/types/types";
import {
  CartItem,
  clearCartAction,
  clearCartItemAction,
  getCartAction,
} from "@/server/actions/cart";

export default function Cart() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // États pour l'adresse
  const [addressInput, setAddressInput] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressData[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  // États pour le paiement
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    const getCartData = async () => {
      const { cart } = await getCartAction();
      if (cart) {
        setCart(cart.items);
      }
    };

    getCartData();
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    searchAddress(value, setAddressSuggestions, setShowSuggestions);
  };

  const handleAddressSelect = (feature: AddressData) => {
    const { label, postcode, city } = feature.properties;
    setAddressInput(label);
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

  const removeItem = async (itemId: string) => {
    const success = await clearCartItemAction(itemId);
    if (success) {
      const { cart: updatedCart } = await getCartAction();
      if (updatedCart) {
        setCart(updatedCart.items);
      }
    } else {
      setError("Erreur lors de la suppression de l'élément du panier");
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const handleSubmit = async () => {
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

      // Process cart items for booking

      // Implement your booking creation logic here
      // await createBooking({
      //   userId: user.id,
      //   items: cart,
      //   totalAmount,
      //   status: "confirmed",
      //   address: {
      //     streetNumber,
      //     street,
      //     city,
      //     postalCode
      //   }
      // });

      await clearCartAction();
      setSuccess(true);
    } catch (err) {
      console.error("Erreur lors de la réservation:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-card rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Réservation confirmée !
            </h2>
            <p className="text-muted-foreground mb-6">
              Votre réservation a été effectuée avec succès. Vous recevrez un
              email de confirmation.
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-primary text-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retour aux evènements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Votre panier est vide
            </h2>
            <Link
              href="/events"
              className="inline-block px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
            >
              Voir les évènements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Panier</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-8">
            {/* Adress */}
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
                <MapPin className="w-5 h-5 mr-2" />
                Adresse
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Rechercher une adresse
                  </label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={handleAddressChange}
                    className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Commencez à taper une adresse..."
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((feature, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-accent focus:outline-none focus:bg-accent text-popover-foreground"
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
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Numéro
                    </label>
                    <input
                      type="text"
                      value={streetNumber}
                      onChange={e => setStreetNumber(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Ex: 12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Rue
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Nom de la rue"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Ville"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Code postal"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
                <CreditCard className="w-5 h-5 mr-2" />
                Paiement
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Date d&apos;expiration
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={e =>
                        setExpiryDate(formatExpiryDate(e.target.value))
                      }
                      className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={e =>
                        setCvv(e.target.value.replace(/\D/g, "").substr(0, 3))
                      }
                      className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="123"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="JOHN DOE"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Récapitulatif
            </h2>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.eventId} - ${index}`}
                  className="flex justify-between items-center group"
                >
                  <div className="flex-1">
                    <span className="font-medium text-foreground">
                      {item.eventName}
                    </span>
                    <span className="block text-foreground">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-foreground">
                      {item.price.toFixed(2)} €
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="w-full bg-primary text-background py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
