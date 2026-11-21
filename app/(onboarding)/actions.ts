"use server"

import { revalidatePath } from "next/cache";
import { sql } from "../lib/db"
import { getUser } from "../lib/auth/get-user";
import { redirect } from "next/navigation";
import { OnboardingMovie } from "@/types";
import { addPosterUrlToBatch } from "../features/dashboard/queries";

const RECOMMENDER_URL = process.env.RECOMMENDER_URL;
const RECOMMENDER_API_KEY = process.env.RECOMMENDER_API_KEY;

export const saveGenres = async (genres: Set<string | number>): Promise<{success: false, error: string} | {success: true, error: null}> => {
    if (!(genres instanceof Set)) return { success: false, error: "Invalid input"};

    const user = (await getUser())?.user;
    const user_id = user?.sub;
    if (!user_id) {
        redirect("/login");
    };

    const step = 2;

    const coercedSet = Array.from(genres, (genre) => Number(genre)); // coerce each value into a number
    const filteredSet = coercedSet.filter((validIds) => Number.isInteger(validIds) && validIds > 0); // validate
    const dedupedArray = Array.from(new Set<number>(filteredSet)); // turn to set to remove duplicates
    if (dedupedArray.length <= 0) return { success: false, error: "Nothing to save."}
    if (dedupedArray.length !== genres.size) return { success: false, error: "Invalid input" };

    try {
        const response = await sql `
            SELECT genres.id FROM genres
            WHERE genres.id = ANY(${dedupedArray}::int[])
        `;

        if (response.length !== dedupedArray.length) return { success: false, error: "Invalid input."};

        await sql.transaction([
            sql `
                DELETE FROM onboarding_genres WHERE user_id = ${user_id}
                AND EXISTS (
                    SELECT 1 FROM users
                    WHERE user_id = ${user_id} AND onboarded_at IS NULL
                )
            `,
            sql `
                INSERT INTO onboarding_genres (user_id, genre_id)
                SELECT ${user_id}, unnest(${dedupedArray}::int[])
                WHERE EXISTS (
                    SELECT 1 FROM users
                    WHERE user_id = ${user_id} AND onboarded_at IS NULL
                )
            `,
            sql `
                UPDATE users SET onboarded_step = ${step + 1} 
                WHERE user_id = ${user_id} AND onboarded_at IS NULL
            `
        ]);
        revalidatePath("/", "layout");
        return { success: true, error: null }
    } catch (err) {
        console.error(err);
        return { success: false, error: "saveGenres failed."}
    }
}

export const saveFilms = async (films: Set<string | number>) => {
    const user = (await getUser())?.user;
    const user_id = user?.sub;
    if (!user_id) {
        redirect("/login");
    };

    if (!RECOMMENDER_API_KEY) {
        console.log("RECOMMENDER_API_KEY not set.");
        return;
    }

    const coercedSet = Array.from(films, (film) => Number(film));
    const filteredSet = coercedSet.filter((validIds) => validIds > 0 && Number.isInteger(validIds));
    const dedupedArray = Array.from(new Set<number>(filteredSet));

    if (dedupedArray.length !== 4 || dedupedArray.length !== films.size) return {
        success: false,
        error: "Invalid input"
    };

    try {
        const response = await sql `
            SELECT movies.id FROM movies
            WHERE movies.id = ANY(${dedupedArray}::int[])
        `;
        if (response.length !== dedupedArray.length) return { success: false, error: "Invalid input." }

        await sql.transaction([
            sql `
                DELETE FROM onboarding_movies
                WHERE user_id = ${user_id}
                AND EXISTS (
                    SELECT 1 FROM users
                    WHERE user_id = ${user_id} AND onboarded_at IS NULL
                )
            `,
            sql `
                INSERT INTO onboarding_movies (user_id, movie_id)
                SELECT ${user_id}, unnest(${dedupedArray}::int[])
                WHERE EXISTS (
                    SELECT 1 FROM users
                    WHERE user_id = ${user_id} AND onboarded_at IS NULL
                )
            `,
            sql `
                UPDATE users
                SET onboarded_at = now(), 
                onboarded_step = NULL
                WHERE user_id = ${user_id} AND onboarded_at IS NULL
            `,
        ]);

        // PUT (save_preferences)
        try {
            const apiResponse = await fetch(`${RECOMMENDER_URL}/v1/users/${user_id}/preferences`, 
            {
                method: "PUT",
                headers: {
                    "X-API-Key": RECOMMENDER_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ film_ids: dedupedArray}),
                signal: AbortSignal.timeout(10000)
             })
            if (!apiResponse.ok) {
                console.error(`${apiResponse.status}`)
            }
        } catch (err) {
            console.error("recommender PUT failed", err)
        }
    
        console.log("Films saved.")
        return { success: true, error: null };
    } catch (err) {
        console.error(err);
        return { success: false, error: "saveFilms failed" };
    }
}

export const skipOnboarding = async (): Promise<{success: false, error: string} | {success: true, error: null}> => {
    const user = (await getUser())?.user;
    const user_id = user?.sub;
    if (!user_id) {
        redirect("/login");
    };

    try {
        await sql `
            UPDATE users
            SET 
                onboarded_at = now(),
                onboarded_step = NULL
            WHERE onboarded_at IS NULL AND user_id = ${user_id}
        `;
        revalidatePath("/", "layout"); 

        return { success: true, error: null };
    } catch (err) {
        console.error(err);
        return { success: false, error: "skipOnboarding failed."}
    }
}

export const generateDiversifiedMoviesFromGenre = async (): Promise<{ success: false, error: string} | { success: true, response: { displayBatch: OnboardingMovie[] }, error: null }> => {
    const user = (await getUser())?.user;
    const user_id = user?.sub;

    if (!user_id) {
        console.error("Unauthenticated user.");
        redirect("/login");
    };

    try {
        const [{exists}] = await sql `
            SELECT EXISTS ( SELECT 1 FROM onboarding_genres WHERE user_id = ${user_id})
        `;
        let response: OnboardingMovie[];
        if (!exists) {
            response = (await sql `
                SELECT id, title, release_date::text, poster_path
                FROM movies
                WHERE poster_path IS NOT NULL
                ORDER BY vote_count DESC, id
                LIMIT 30
            `) as OnboardingMovie[];
        } else {
            response = (await sql `
            SELECT id, title, release_date, poster_path, genre_id
            FROM (
                SELECT 
                    m.id,
                    m.title,
                    m.release_date::text,
                    m.poster_path,
                    og.genre_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY og.genre_id
                        ORDER BY m.vote_count DESC, m.id
                    ) AS rn
                FROM onboarding_genres og
                JOIN movie_genre_join mg ON mg.genre_id = og.genre_id
                JOIN movies m ON m.id = mg.movie_id
                WHERE og.user_id = ${user_id}
                    AND m.poster_path IS NOT NULL
                    AND m.adult = false
            ) ranked
            WHERE rn <= 30
        `) as OnboardingMovie[];

        }
        // remove the duplicates
        const unshuffledMovies = [...new Map(response.map((movie) => [movie.id, movie])).values()];
        
        const pool = addPosterUrlToBatch({
            movies: unshuffledMovies,
            size: "w500"
        });

        return { success: true, response: { displayBatch: pool }, error: null }
    } catch (err) {
        console.error(err);
        return { success: false, error: "generateDiversifiedMoviesFromGenre failed." };
    }
}