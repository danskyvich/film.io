# film.io

A movie discovery web app. Users sign up, go through a short onboarding (favorite genres, then favorite films), and land on a dashboard with trending, top rated, per-genre, and personalized recommendation rows.

## Features

- **Authentication** with per-user sessions
- **Onboarding flow:** pick 5 genres (step 2), then pick 4 films drawn from those genres. Users can skip at any point.
- **Dashboard** with trending, top rated, and per-genre rows, visible to everyone (logged in or not)
- **Personalized recommendations row**, shown only to logged-in users who finished onboarding with film picks. Users who skipped see no row.
- Movie data sourced from TMDB (film IDs equal TMDB IDs)
- Recommender engine: [film-io-recommender-system](https://github.com/danskyvich/film.io-recommender-system)

## Tech stack

- **Framework:** Next.js (App Router, server components and server actions)
- **Language:** TypeScript
- **Database:** Neon (Postgres), accessed through the `sql` client
- **Recommendations:** a separate microservice, [film.io Recommender](#) _(link your recommender repo)_
- _Add: styling library, auth provider, hosting platform._

## Architecture

```
Browser
  │
  ▼
film.io (Next.js, server-side)
  ├── Neon DB: users, movies, genres, movie_genre_join,
  │            onboarding_genres, onboarding_movies
  └── Recommender service (HTTP, API key)
        ├── PUT /v1/users/{id}/preferences       end of onboarding
        └── GET /v1/users/{id}/recommendations   dashboard
```

The browser never talks to the recommender. All calls happen in server actions, so the API key stays on the server.

### Onboarding flow

1. **Genres:** `saveGenres` validates the selected genre IDs against the `genres` table and stores them in `onboarding_genres`, then advances `onboarded_step`.
2. **Films:** `generateDiversifiedMoviesFromGenre` builds a pool of films from the chosen genres (top films per genre by vote count, excluding adult films and films without posters). With no genres chosen, it falls back to the most-voted films overall.
3. **Save films:** `saveFilms` validates the 4 picks against `movies`, stores them in `onboarding_movies`, and marks the user onboarded, all in one transaction guarded by `onboarded_at IS NULL` so a finished onboarding can't be overwritten. It then sends the picks to the recommender with a `PUT`.
4. **Skip:** `skipOnboarding` marks the user onboarded without saving films. Nothing is sent to the recommender.

The recommender `PUT` is best-effort: it has its own `try/catch`, and a failure is logged without failing onboarding.

### Recommendations on the dashboard

`fetchRecommendations` runs server-side for logged-in, onboarded users:

1. Calls the recommender (`GET ...?limit=20`) with the `X-API-Key` header, `cache: "no-store"`, and a 4 second timeout.
2. Takes the returned film IDs and loads those films from the local `movies` table (with genre IDs and production companies), excluding adult films and films without posters.
3. Restores the recommender's ranking, since SQL `ANY(...)` does not preserve order.
4. Adds poster URLs and returns the list.

If the recommender fails, times out, or returns nothing (for example, the user skipped onboarding), the function returns an empty list and the dashboard simply hides the row. Trending and top rated are unaffected.

## Getting started

**Prerequisites:** Node.js and a Neon database. _(Add the package manager and Node version you use.)_

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

**Environment variables** (names only; see `.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string _(use your actual variable name)_ |
| `ENGINE_URL` | Base URL of the recommender service, no trailing slash |
| `RECOMMENDER_API_KEY` | Shared secret sent as `X-API-Key` (same value as on the recommender) |
| _auth variables_ | _Add whatever your auth setup needs_ |

Never commit `.env.local`.

## Database

Main tables used by the features above: `users` (with `onboarded_at` and `onboarded_step`), `movies`, `genres`, `movie_genre_join`, `onboarding_genres`, `onboarding_movies`.

## Related projects

- **[film.io Recommender](#)**: content-based recommendation service (FastAPI, scikit-learn, TF-IDF). It reads film data from this app's database through a read-only role for offline training, and stores users' onboarding picks in its own separate database.

## Roadmap

[] Stream the recommendations row with `Suspense` so a cold recommender never delays the dashboard
[] Send watch and rating events to the recommender for collaborative filtering
[] Retry failed preference syncs
[] Search feature
[] Enrich movie page details with new information pulled from TMDB
[] Language support
