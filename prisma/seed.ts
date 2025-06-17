import { PrismaClient } from "@prisma/client";

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
          "Quête secondaire qui consiste à réparer la FreeBoax HD ADSL ou passer à la fibre.",
        images: [
          "data:image/webp;base64,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",
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
