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
    prisma.user.create({
      data: {
        id: "c3b2a1d4-5f6e-4b7c-8d9e-0f1a2b3c4d5e",
        email: "e@e.com",
        name: "Eden",
        role: "admin",
        emailVerified: true,
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
    prisma.account.create({
      data: {
        id: "account-c3b2a1d4-5f6e-4b7c-8d9e-0f1a2b3c4d5e",
        accountId: "c3b2a1d4-5f6e-4b7c-8d9e-0f1a2b3c4d5e", // Eden
        userId: "c3b2a1d4-5f6e-4b7c-8d9e-0f1a2b3c4d5e",
        providerId: "credential",
        password:
          "22ee9b33cf4d76185069891071b834c3:cdd6fbc773d6f7306c338079a710b38876b29a106f089be9079196590fc3bc3117f2acd0c56be00e39cb81f40ff3272c4574583434e181c83414411fe6ee8370",
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
        map: {
          image: undefined,
          svg: {
            data: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" version="1.1" viewBox="0 0 1380 1000" id="svgDisplayed">
        <g id="svgContent">
            <polygon id="698406921" points="583,274,573,348,629,352,631,277" class="clickable-area"></polygon>
            <polygon id="698406922" points="631,352,643,279,691,284,684,358" class="clickable-area"></polygon>
            <polygon id="698406923" points="687,358,702,285,750,292,740,366" class="clickable-area"></polygon>
            <polygon id="698406924" points="744,367,797,376,807,301,761,293" class="clickable-area"></polygon>
            <polygon id="698406925" points="799,376,820,304,866,313,854,387" class="clickable-area"></polygon>
            <polygon id="698406927" points="897,404,941,341,955,352,970,366,984,382,994,397,925,433,918,424,950,396,937,383,905,411" class="clickable-area"></polygon>
            <polygon id="698406928" points="927,438,999,404,1007,421,1012,440,1015,456,937,471,935,458,932,447" class="clickable-area"></polygon>
            <polygon id="698406929" points="937,474,1016,468,1018,509,938,514" class="clickable-area"></polygon>
            <polygon id="698406931" points="923,598,933,559,1012,572,1002,614" class="clickable-area"></polygon>
            <polygon id="698406932" points="905,633,914,620,922,601,1000,624,991,643,981,661,971,674" class="clickable-area"></polygon>
            <polygon id="698406933" points="903,636,965,682,954,693,933,709,912,721,895,728,863,660,876,654,903,687,919,677,892,644" class="clickable-area"></polygon>
            <polygon id="698406935" points="756,659,787,662,816,664,809,736,757,732" class="clickable-area"></polygon>
            <polygon id="698406936" points="709,653,753,659,746,714,702,709" class="clickable-area"></polygon>
            <polygon id="698406937" points="625,653,657,658,655,673,666,675,669,660,701,665,690,726,612,714" class="clickable-area"></polygon>
            <polygon id="698406938" points="577,631,622,640,607,694,565,686" class="clickable-area"></polygon>
            <polygon id="698406939" points="517,618,575,631,554,684,503,672" class="clickable-area"></polygon>
            <polygon id="698406941" points="492,214,510,210,530,207,550,205,552,255,534,256,518,259,505,263" class="clickable-area"></polygon>
            <polygon id="698406942" points="552,255,604,258,667,264,673,215,642,212,610,209,580,207,550,205" class="clickable-area"></polygon>
            <polygon id="698406943" points="667,264,726,271,790,281,800,232,734,222,673,215" class="clickable-area"></polygon>
            <polygon id="698406944" points="800,232,857,243,917,257,900,304,846,291,790,281" class="clickable-area"></polygon>
            <polygon id="698406945" points="917,257,935,263,956,273,987,291,1005,305,1018,318,982,353,967,339,946,324,924,313,900,304" class="clickable-area"></polygon>
            <polygon id="698406946" points="982,353,1018,318,1037,339,1052,364,1064,391,1073,415,1027,432,1018,405,1008,385,995,368" class="clickable-area"></polygon>
            <polygon id="698406947" points="1027,432,1073,415,1078,444,1081,474,1081,505,1079,535,1033,538,1034,496,1031,455" class="clickable-area"></polygon>
            <polygon id="698406948" points="1033,538,1079,535,1076,567,1070,594,1062,625,1051,655,1009,643,1022,603,1030,565" class="clickable-area"></polygon>
            <polygon id="698406949" points="1009,643,1051,655,1036,682,1018,704,996,726,969,745,946,717,966,702,983,684,997,664" class="clickable-area"></polygon>
            <polygon id="698406950" points="946,717,970,745,943,760,916,769,884,777,849,780,844,749,872,746,899,740,924,730" class="clickable-area"></polygon>
            <polygon id="698406951" points="844,749,849,780,818,779,782,777,747,774,712,770,716,738,756,743,802,747" class="clickable-area"></polygon>
            <polygon id="698406952" points="716,738,712,770,642,760,574,748,582,717" class="clickable-area"></polygon>
            <polygon id="698406953" points="582,717,574,748,501,732,439,716,464,690,514,703" class="clickable-area"></polygon>
            <polygon id="698406954" points="464,690,439,716,413,705,384,688,413,665,435,679" class="clickable-area"></polygon>
            <polygon id="698406955" points="492,214,511,210,530,207,550,205,548,137,527,141,496,149,476,156" class="clickable-area"></polygon>
            <polygon id="698406956" points="548,137,591,133,648,133,678,133,670,213,610,208,550,205" class="clickable-area"></polygon>
            <polygon id="698406957" points="678,133,726,137,778,145,810,151,797,231,736,222,670,213" class="clickable-area"></polygon>
            <polygon id="698406958" points="810,151,873,167,938,190,917,256,887,249,843,239,797,231" class="clickable-area"></polygon>
            <polygon id="698406959" points="938,190,917,256,936,262,970,280,987,290,1008,307,1017,316,1055,276,1039,259,1022,243,1005,229,987,217,962,201" class="clickable-area"></polygon>
            <polygon id="698406960" points="1017,316,1055,276,1068,292,1088,321,1102,346,1111,368,1120,396,1073,412,1063,385,1052,361,1038,338" class="clickable-area"></polygon>
            <polygon id="698406961" points="1073,412,1120,396,1126,424,1130,462,1132,483,1125,483,1117,494,1114,528,1082,530,1083,500,1083,470,1079,438" class="clickable-area"></polygon>
            <polygon id="698406962" points="1082,530,1114,528,1112,560,1125,561,1120,594,1111,631,1101,662,1055,649,1065,621,1073,592,1079,560" class="clickable-area"></polygon>
            <polygon id="698406963" points="1101,662,1055,649,1038,681,1022,701,1000,724,977,742,1009,780,1036,758,1059,734,1076,710,1091,685" class="clickable-area"></polygon>
            <polygon id="698406964" points="977,742,1009,780,989,794,955,812,926,824,891,833,858,839,851,781,886,778,917,771,945,761" class="clickable-area"></polygon>
            <polygon id="698406965" points="851,781,858,839,823,841,776,842,711,838,718,785,710,784,712,771,745,775,790,779,823,781" class="clickable-area"></polygon>
            <polygon id="698406966" points="711,838,677,835,685,788,685,781,587,765,576,819,540,811,557,760,567,762,571,749,606,756,677,767,712,771,710,784,718,785" class="clickable-area"></polygon>
            <polygon id="698406967" points="571,749,567,762,557,760,540,811,492,798,444,782,404,767,437,717,469,726,502,735,538,742" class="clickable-area"></polygon>
            <polygon id="698406968" points="437,717,404,767,366,745,338,723,380,688,406,704" class="clickable-area"></polygon>
            <polygon id="PELOUSE_1" points="660,596,694,405,553,385,513,574" class="clickable-area"></polygon>
            <polygon id="PELOUSE_2" points="861,430,694,405,660,596,836,624" class="clickable-area"></polygon>
        </g>
    </svg>`,
            name: "FreeBoax HD ADSL",
          },
        },
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
            count: 1,
            price: 125,
          },
          {
            type: "Installer la Fibre",
            count: 1,
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

    // j'étais obligé tel le fanboy que je suis
    prisma.event.create({
      data: {
        title: "Linkin Park - From Zero World Tour 2026",
        startDate: "2026-06-16",
        startTime: "21:00",
        endDate: "2026-06-16",
        endTime: "23:00",
        place: "Groupama Stadium",
        address: "10 Avenue Simone Veil",
        city: "Décines-Charpieu",
        postalCode: "69150",
        description:
          'Le groupe légendaire Linkin Park revient sur la scène française pour un concert au Groupama Stadium le 16 juin 2026 lors de leur tournée From Zero World Tour. Le groupe, qui a récemment fait son retour avec un nouvel album percutant, promet un show qui va marquer les esprits. Entre leurs classiques comme "Numb", "In the End" et les nouveaux comme "The Emptiness Machine" ou bien encore "Heavy is the Crown" , préparez-vous à une soirée mémorable.',
        images: await Promise.all([
          FileToBase64Node(
            path.join(__dirname, "images-seed", "lp-1.jpg"),
            "lp1"
          ),
          FileToBase64Node(
            path.join(__dirname, "images-seed", "lp-2.jpg"),
            "lp-2"
          ),
        ]),
        categories: ["Musique", "Concert", "Rock"],
        isPaid: true,
        prices: [
          { type: "VIP", price: 250.0 },
          { type: "Pelouse Or", price: 150.0 },
          { type: "Pelouse", price: 120.0 },
          { type: "Catégorie 1", price: 100.0 },
          { type: "Catégorie 2", price: 85.0 },
          { type: "Catégorie 3", price: 75.0 },
          { type: "Catégorie 4", price: 65.0 },
        ],
        organizerWebsite: "https://linkinpark.com",
        organizerPhone: "",
        createdBy: users[1].id,
        status: "PUBLISHED",
        isRecurring: false,
        recurringDays: [],
        recurringEndDate: null,
        isAccessible: true,
        hasParking: true,
        hasPublicTransport: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
