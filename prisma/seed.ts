import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Convertir les images en base64
// marche seulement dans un environnement Node
export async function FileToBase64Node(
  path: string,
  fileName: string
): Promise<string> {
  const fileBuffer = fs.readFileSync(path);
  const file = new File([new Uint8Array(fileBuffer)], fileName, {
    type: "image/webp",
  });
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  return `data:${file.type};base64,${base64}`;
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed...");

  // Nettoyer les données existantes
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.cinemaRoom.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.event.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Données existantes supprimées");

  // Créer des utilisateurs
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "f6f6855a-deb8-4314-877e-02ffebb6f70e",
        email: "organizer@example.com",
        name: "Marie Organisatrice",
        role: "organizer",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/png?seed=marie",
      },
    }),
    prisma.user.create({
      data: {
        id: "5usWgZttnsQOHEPCHdu51AHJ9qcrhDrE",
        email: "admin@example.com",
        name: "Jean michel admin",
        role: "admin",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/png?seed=jean",
      },
    }),
  ]);

  // Créer les comptes après les utilisateurs
  await Promise.all([
    prisma.account.create({
      data: {
        id: "account-f6f6855a-deb8-4314-877e-02ffebb6f70e",
        accountId: "f6f6855a-deb8-4314-877e-02ffebb6f70e", // organizer
        userId: "f6f6855a-deb8-4314-877e-02ffebb6f70e",
        providerId: "credential",
        password:
          "4194721bd9a5abc9c06a26396abb04d4:3cf4c960b36c14e454a0d5ba0d522fecd59e8912d78e23e102e534a2856136b7abd798205faee3eb75ac5a9f985ce1e6d0b60393d693ce1e591011fd0b8867e6", // azertyuiop
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.account.create({
      data: {
        id: "account-5usWgZttnsQOHEPCHdu51AHJ9qcrhDrE",
        accountId: "5usWgZttnsQOHEPCHdu51AHJ9qcrhDrE", // admin
        userId: "5usWgZttnsQOHEPCHdu51AHJ9qcrhDrE",
        providerId: "credential",
        password:
          "4194721bd9a5abc9c06a26396abb04d4:3cf4c960b36c14e454a0d5ba0d522fecd59e8912d78e23e102e534a2856136b7abd798205faee3eb75ac5a9f985ce1e6d0b60393d693ce1e591011fd0b8867e6", // azertyuiop
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  console.log("👥 Utilisateurs créés");

  // Créer des événements
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: "Réparer la FreeBoax HD",
        startDate: "2025-06-26",
        startTime: "13:45",
        endDate: "2025-06-26",
        endTime: "14:30",
        place: "Chez Moi",
        address: "32 Rue Marie Guillemot",
        city: "Villiers-Saint-Benoît",
        postalCode: "89130",
        description:
          "Quête secondaire qui consiste à réparer la FreeBoax HD ADSL ou passer à la fibre. Cette quête est disponible pour les abonnés Freebox ADSL et Fibre. Objectif: Réparer la FreeBoax HD ADSL ou passer à la fibre. Récompense: Accès à Internet haut débit et télévision. Conditions: Être abonné Freebox ADSL ou Fibre. Avoir une FreeBoax HD ADSL défectueuse ou être éligible à la fibre. Étapes: 1. Vérifier l'état de la FreeBoax HD ADSL.2. Contacter le support Free pour signaler le problème. 3. Suivre les instructions du support pour réparer ou remplacer la FreeBoax HD ADSL. 4. Si éligible, demander le passage à la fibre. 5. Suivre les instructions du support pour installer la FreeBoax Fibre. Notes: Cette quête peut prendre plusieurs jours en fonction de la disponibilité du support Free. Il est recommandé de sauvegarder vos données avant de commencer cette quête.",
        images: [
          await FileToBase64Node(
            path.join(__dirname, "images-seed", "freeboax.jpg"),
            "freeboax"
          ),
        ],
        categories: ["Autre"],
        isPaid: true,
        prices: [
          {
            type: "Frais de réparations",
            price: 125,
          },
          {
            type: "Installer la Fibre",
            price: 75,
          },
        ],
        organizerWebsite: "",
        organizerPhone: "",
        createdBy: users[0].id,
        status: "PUBLISHED",
        isRecurring: false,
        recurringDays: [],
        recurringEndDate: null,
        isAccessible: false,
        hasParking: false,
        hasPublicTransport: false,
        createdAt: "2025-06-17T12:16:31.749Z",
        updatedAt: "2025-06-17T12:16:32.132Z",
      },
    }),
    prisma.event.create({
      data: {
        title: "Festival de Jazz de Paris",
        startDate: "2024-07-15",
        startTime: "20:00",
        endDate: "2024-07-15",
        endTime: "23:30",
        place: "Parc de la Villette",
        address: "211 Avenue Jean Jaurès",
        city: "Paris",
        postalCode: "75019",
        description:
          "Un festival de jazz exceptionnel avec des artistes internationaux. Venez découvrir les plus grands noms du jazz dans un cadre magnifique.",
        images: [
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
        ],
        categories: ["Musique", "Jazz", "Festival"],
        isPaid: true,
        prices: [
          { type: "Étudiant", price: 25.0 },
          { type: "Adulte", price: 45.0 },
          { type: "VIP", price: 85.0 },
        ],
        organizerWebsite: "https://jazzfestival-paris.fr",
        organizerPhone: "01 42 36 78 90",
        createdBy: users[1].id, // Marie Organisatrice
        status: "PUBLISHED",
        isAccessible: true,
        hasParking: true,
        hasPublicTransport: true,
      },
    }),
    prisma.event.create({
      data: {
        title: "Marathon de Marseille",
        startDate: "2024-09-22",
        startTime: "08:00",
        endDate: "2024-09-22",
        endTime: "14:00",
        place: "Vieux-Port de Marseille",
        address: "Quai du Port",
        city: "Marseille",
        postalCode: "13002",
        description:
          "Participez au marathon annuel de Marseille ! Parcours de 42km à travers les plus beaux quartiers de la cité phocéenne.",
        images: [
          "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
          "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800",
        ],
        categories: ["Sport", "Course", "Marathon"],
        isPaid: true,
        prices: [
          { type: "Inscription Standard", price: 65.0 },
          { type: "Inscription + Pack", price: 85.0 },
        ],
        organizerWebsite: "https://marathon-marseille.com",
        organizerPhone: "04 91 24 67 89",
        createdBy: users[0].id, // Admin
        status: "PUBLISHED",
        isAccessible: false,
        hasParking: true,
        hasPublicTransport: true,
      },
    }),
    prisma.event.create({
      data: {
        title: "Atelier de Cuisine",
        startDate: "2024-06-20",
        startTime: "14:00",
        endDate: "2024-06-20",
        endTime: "17:00",
        place: "École de Cuisine Gourmande",
        address: "45 Rue de la Gastronomie",
        city: "Nice",
        postalCode: "06000",
        description:
          "Apprenez à cuisiner comme un chef ! Atelier de 3h avec un chef étoilé. Menu surprise et dégustation inclus.",
        images: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        ],
        categories: ["Cuisine", "Atelier", "Gastronomie"],
        isPaid: true,
        prices: [{ type: "Adulte", price: 120.0 }],
        organizerWebsite: "https://ecole-cuisine-nice.fr",
        organizerPhone: "04 93 87 65 43",
        createdBy: users[1].id,
        status: "DRAFT",
        isAccessible: true,
        hasParking: true,
        hasPublicTransport: false,
      },
    }),
    prisma.event.create({
      data: {
        title: "Concert de Musique Classique",
        startDate: "2024-08-10",
        startTime: "20:30",
        endDate: "2024-08-10",
        endTime: "22:30",
        place: "Opéra de Bordeaux",
        address: "Place de la Comédie",
        city: "Bordeaux",
        postalCode: "33000",
        description:
          "Concert exceptionnel de l'Orchestre National de Bordeaux. Au programme : Beethoven, Mozart et Chopin.",
        images: [
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        ],
        categories: ["Musique", "Classique", "Concert"],
        isPaid: true,
        prices: [
          { type: "Catégorie 3", price: 35.0 },
          { type: "Catégorie 2", price: 55.0 },
          { type: "Catégorie 1", price: 75.0 },
        ],
        organizerWebsite: "https://opera-bordeaux.com",
        organizerPhone: "05 56 00 85 95",
        createdBy: users[1].id,
        status: "PUBLISHED",
        isRecurring: true,
        recurringDays: ["friday"],
        recurringEndDate: "2024-12-31",
        isAccessible: true,
        hasParking: false,
        hasPublicTransport: true,
      },
    }),
  ]);

  console.log("🎪 Événements créés");

  // Créer des favoris
  await Promise.all([
    prisma.favorite.create({
      data: {
        userId: users[1].id, // Admin
        eventId: events[0].id, // Festival Jazz
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[1].id, // Admin
        eventId: events[4].id, // Concert Classique
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[0].id, // Marie
        eventId: events[1].id, // Expo Art
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[0].id, // Marie
        eventId: events[2].id, // Marathon
      },
    }),
  ]);

  console.log("❤️ Favoris créés");

  // Créer des salles de cinéma
  const cinemaRooms = await Promise.all([
    prisma.cinemaRoom.create({
      data: {
        name: "Salle 1 - IMAX",
        capacity: 120,
        currentMovie: {
          movieId: 12345,
          title: "Dune: Part Two",
          showtime: "20:00",
          date: "2024-06-15",
        },
      },
    }),
    prisma.cinemaRoom.create({
      data: {
        name: "Salle 2 - Premium",
        capacity: 80,
        currentMovie: {
          movieId: 67890,
          title: "The Batman",
          showtime: "18:30",
          date: "2024-06-15",
        },
      },
    }),
    prisma.cinemaRoom.create({
      data: {
        name: "Salle 3 - Standard",
        capacity: 100,
        currentMovie: {
          movieId: 11111,
          title: "Spider-Man: No Way Home",
          showtime: "21:15",
          date: "2024-06-15",
        },
      },
    }),
  ]);

  console.log("🎬 Salles de cinéma créées");

  // Créer des sièges pour chaque salle
  const seats = [];
  for (const room of cinemaRooms) {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const seatsPerRow = Math.floor(room.capacity / rows.length);

    for (const row of rows) {
      for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
        const seat = await prisma.seat.create({
          data: {
            row,
            number: seatNumber,
            isAvailable: true, // Tous les sièges sont disponibles au début
            roomId: room.id,
          },
        });
        seats.push(seat);
      }
    }
  }

  console.log("🪑 Sièges créés");

  console.log("✅ Seed terminé avec succès !");
  console.log(`📊 Données créées :
    - ${users.length} utilisateurs
    - ${events.length} événements
    - 4 favoris
    - ${cinemaRooms.length} salles de cinéma
    - ${seats.length} sièges
  `);
}

main()
  .catch(e => {
    console.error("❌ Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
