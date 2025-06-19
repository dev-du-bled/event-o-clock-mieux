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
        email: "admin@event-o-clock.fr",
        name: "Administrateur",
        role: "admin",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      },
    }),
    prisma.user.create({
      data: {
        email: "organizer@event-o-clock.fr",
        name: "Marie Organisatrice",
        role: "organizer",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie",
      },
    }),
    prisma.user.create({
      data: {
        email: "jean.dupont@gmail.com",
        name: "Jean Dupont",
        role: "user",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=jean",
      },
    }),
    prisma.user.create({
      data: {
        email: "sophie.martin@yahoo.fr",
        name: "Sophie Martin",
        role: "user",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie",
      },
    }),
    prisma.user.create({
      data: {
        email: "pierre.cinema@hotmail.com",
        name: "Pierre Cinéphile",
        role: "user",
        emailVerified: false,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=pierre",
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
        title: "Exposition Art Moderne",
        startDate: "2024-06-01",
        startTime: "10:00",
        endDate: "2024-08-31",
        endTime: "18:00",
        place: "Musée d'Art Contemporain",
        address: "12 Rue des Beaux-Arts",
        city: "Lyon",
        postalCode: "69001",
        description:
          "Une exposition unique présentant les œuvres d'artistes contemporains du monde entier. Plus de 200 œuvres exposées.",
        images: [
          "https://images.unsplash.com/photo-1544967882-4318b767b525?w=800",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        ],
        categories: ["Art", "Exposition", "Culture"],
        isPaid: true,
        prices: [
          { type: "Enfant", price: 8.0 },
          { type: "Adulte", price: 15.0 },
          { type: "Senior", price: 12.0 },
        ],
        organizerWebsite: "https://musee-lyon.fr",
        organizerPhone: "04 78 92 34 56",
        createdBy: users[1].id,
        status: "PUBLISHED",
        isAccessible: true,
        hasParking: false,
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
        userId: users[2].id, // Jean
        eventId: events[0].id, // Festival Jazz
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[2].id, // Jean
        eventId: events[4].id, // Concert Classique
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[3].id, // Sophie
        eventId: events[1].id, // Expo Art
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[4].id, // Pierre
        eventId: events[0].id, // Festival Jazz
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

  // Créer quelques réservations
  const availableSeats = seats.filter(seat => seat.isAvailable);
  const bookings = [];

  for (let i = 0; i < 5; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomRoom =
      cinemaRooms[Math.floor(Math.random() * cinemaRooms.length)];
    const roomSeats = availableSeats.filter(
      seat => seat.roomId === randomRoom.id
    );

    if (roomSeats.length > 0) {
      const selectedSeats = roomSeats.slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ); // 1-3 sièges

      const booking = await prisma.booking.create({
        data: {
          userId: randomUser.id,
          roomId: randomRoom.id,
          movieId: (
            randomRoom.currentMovie as {
              movieId: number;
              title: string;
              showtime: string;
              date: string;
            }
          ).movieId,
          totalAmount: selectedSeats.length * 12.5,
          status: (["PENDING", "CONFIRMED", "CANCELLED"] as const)[
            Math.floor(Math.random() * 3)
          ],
        },
      });

      bookings.push(booking);

      // Créer les BookingSeat et marquer les sièges comme non disponibles
      for (const seat of selectedSeats) {
        await prisma.bookingSeat.create({
          data: {
            bookingId: booking.id,
            seatId: seat.id,
            ticketType: (["CHILD", "ADULT", "STUDENT"] as const)[
              Math.floor(Math.random() * 3)
            ],
            price: Math.random() > 0.5 ? 12.5 : 8.5,
          },
        });

        // Marquer le siège comme non disponible
        await prisma.seat.update({
          where: { id: seat.id },
          data: { isAvailable: false },
        });
      }
    }
  }

  console.log("🎫 Réservations créées");

  // Créer des messages de contact
  await Promise.all([
    prisma.contactMessage.create({
      data: {
        name: "Alice Dupuis",
        email: "alice.dupuis@gmail.com",
        subject: "Question sur un événement",
        message:
          "Bonjour, j'aimerais avoir plus d'informations sur le Festival de Jazz de Paris. Y a-t-il encore des places disponibles ?",
        status: "PENDING",
      },
    }),
    prisma.contactMessage.create({
      data: {
        name: "Marc Leblanc",
        email: "marc.leblanc@yahoo.fr",
        subject: "Problème de réservation",
        message:
          "J'ai un problème avec ma réservation pour le cinéma. Pouvez-vous m'aider ?",
        status: "SENT",
      },
    }),
    prisma.contactMessage.create({
      data: {
        name: "Julie Martin",
        email: "julie.martin@hotmail.com",
        subject: "Suggestion d'amélioration",
        message:
          "Votre plateforme est géniale ! J'aimerais suggérer d'ajouter un système de notifications pour les nouveaux événements.",
        status: "PENDING",
      },
    }),
  ]);

  console.log("📧 Messages de contact créés");

  console.log("✅ Seed terminé avec succès !");
  console.log(`📊 Données créées :
    - ${users.length} utilisateurs
    - ${events.length} événements
    - 4 favoris
    - ${cinemaRooms.length} salles de cinéma
    - ${seats.length} sièges
    - ${bookings.length} réservations
    - 3 messages de contact`);
}

main()
  .catch(e => {
    console.error("❌ Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
