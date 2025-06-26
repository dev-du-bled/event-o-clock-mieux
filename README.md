# Event'o clock (mieux)

Un site web permettant de partager des événements.

## Mise en place du projet

Pour commencer, il faut instancier le fichier .env et [récupérer une clé TMDB](https://developers.themoviedb.org/3/getting-started/introduction) (nécessaire pour récupérer les données des films).

```bash
cp .env.example .env
```

Ensuite, il faut placer la clé API TMDB sous le nom `NEXT_TMDB_API_KEY`

Une fois cela fait, on peut lancer le projet

### Avec Docker

```bash
docker compose up -d --build
```

### Avec bun

Ici, on utilise bun en tant que gestionnaire de dépendances et runtime pour profite de ses performances.

```bash
bun install
```

```bash
# Mode développement
bun --bun run dev
```

```bash
# Mode production
bun run build
bun run start
```

## Seeding (mise des données par défaut)

⚠️ En utilisant Docker, ceci n'est pas possible puisque la solution générée est une solution dite "de production".

Le seeding permettera de créer les utilisateurs privilégiés ainsi qu'un set de données par défaut à des fins de test.

```bash
bun run db:seed
```

## Utilisateurs par défaut

Ce sont les utilisateurs créés après le seeding (processus de création des données par défaut).

- Admin: `admin@example.com`
- Organisateur: `organizer@example.com`

Le mot de passe pour ces 2 utilisateurs par défaut est `azertyuiop`.
