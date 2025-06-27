"use server";

import prisma from "@/lib/prisma";
import { getUser } from "../util/getUser";
import { Price } from "@/schemas/createEvent";

export type CartItem = {
  id: string;
  eventId: string;
  eventName: string;
  type: string;
  price: number;
  quantity: number;
};

import { v4 as uuidv4 } from "uuid";

export async function addToCartAction(
  items: Omit<CartItem, "id">[]
): Promise<{ success: boolean; message?: string }> {
  const user = await getUser();
  if (!user) {
    return {
      success: false,
      message: "Vous devez être connecté pour ajouter des articles au panier.",
    };
  }

  try {
    // check for existing cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
          items: [],
          totalAmount: 0,
        },
      });
    }

    // unique ids for cart items
    const itemsWithIds = items.map(item => ({
      ...item,
      id: uuidv4(),
    }));

    const updatedItems: CartItem[] = [
      ...((cart.items as CartItem[]) || []),
      ...itemsWithIds,
    ];

    const totalAmount = updatedItems.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: updatedItems as CartItem[],
        totalAmount: totalAmount,
      },
    });

    for (const item of items) {
      const event = await prisma.event.findUnique({
        where: { id: item.eventId },
        select: { prices: true },
      });

      if (!event) continue;

      const updatedDbPrices = (event.prices as Price[]).map(priceObj => {
        if (priceObj.type === "a") {
          return {
            ...priceObj,
            count: (priceObj.count || 0) + item.quantity,
          };
        }
        return priceObj;
      });

      await prisma.event.update({
        where: { id: item.eventId },
        data: {
          prices: updatedDbPrices,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'ajout au panier:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'ajout au panier.",
    };
  }
}

export async function getCartAction(): Promise<{
  success: boolean;
  cart?: { items: CartItem[]; totalAmount: number };
  message?: string;
}> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Vous devez être connecté pour voir votre panier.",
    };
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      return { success: true, cart: { items: [], totalAmount: 0 } };
    }

    return {
      success: true,
      cart: {
        items: (cart.items as CartItem[]) || [],
        totalAmount: cart.totalAmount,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du panier:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la récupération du panier.",
    };
  }
}

export async function clearCartAction(): Promise<{
  success: boolean;
  message?: string;
}> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Vous devez être connecté pour vider votre panier.",
    };
  }

  try {
    await prisma.cart.delete({
      where: { userId: user.id },
    });

    return { success: true, message: "Panier vidé avec succès." };
  } catch (error) {
    console.error("Erreur lors de la vidange du panier:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la vidange du panier.",
    };
  }
}

export async function clearCartItemAction(
  itemId: string
): Promise<{ success: boolean; message?: string }> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Vous devez être connecté pour supprimer un article du panier.",
    };
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      return { success: true, message: "Panier déjà vide." };
    }

    const updatedItems = (cart.items as CartItem[]).filter(
      item => item.id !== itemId
    );

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: updatedItems,
        totalAmount: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      },
    });

    return {
      success: true,
      message: "Article supprimé du panier avec succès.",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'article du panier:",
      error
    );
    return {
      success: false,
      message:
        "Une erreur est survenue lors de la suppression de l'article du panier.",
    };
  }
}
