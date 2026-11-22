"use server"

import { getUser } from "@/app/lib/auth/get-user";
import { recommender_sql, sql } from "@/app/lib/db";
import { ManagementClient } from "auth0";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const management = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN!.replace(/^https?:\/\//, ""),
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

export async function deleteAccount() {
    const { user } = await getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const userId = user.sub;

    try {
        await sql.transaction([
            sql `DELETE FROM ratings WHERE user_id = ${userId} `,
            sql `DELETE FROM watchlist WHERE user_id = ${userId}`,
            sql `DELETE FROM onboarding_genres WHERE user_id = ${userId}`,
            sql `DELETE FROM onboarding_movies WHERE user_id = ${userId}`,
            sql `DELETE FROM user_preferences WHERE user_id = ${userId}`,
            sql `DELETE FROM users WHERE user_id = ${userId}`,
        ]);

        await recommender_sql `
            DELETE FROM user_preferences WHERE user_id = ${userId}
        `

        await management.users.delete(userId);
    } catch (err) {
        console.error("deleteAccount failed: ", err);
        return { success: false, error: "Could not delete account."}
    }

    redirect("/auth/logout");
} 

export async function clearRatingsAndWatchlist() {
    const user = (await getUser())?.user;
    const user_id = user?.sub;

    if (!user_id) return { success: false, error: "Unauthenticated user."};

    try {
        await sql.transaction([
            sql `DELETE FROM ratings
            WHERE user_id = ${user_id}`,
            sql `DELETE FROM watchlist
            WHERE user_id = ${user_id}         `
        ]);
        return { success: true, error: null }
    } catch (err) {
        console.error(err);
        return { success: false, error: "clearRatingsAndWatchlist failed"}
    }
}

export async function redoOnboarding() {
    const user = (await getUser())?.user;
    const user_id = user?.sub;

    if (!user_id) return { success: false, error: "Unauthenticated user."};

    try {
        await sql.transaction([
            sql `UPDATE users
            SET onboarded_at = NULL
            WHERE user_id = ${user_id}
            `,
            sql `DELETE FROM onboarding_genres
            WHERE user_id = ${user_id}
            `,
            sql `DELETE FROM onboarding_movies
            WHERE user_id = ${user_id}
            `,
        ])
    } catch (err) {
        console.error("redoOnboarding failed", err)
    }
    revalidatePath("/", "layout")
    redirect("/onboarding/genre-step")
}

// Hide and show rated and watchlist movies
export async function hideAndShowMovies(show: boolean): Promise<{ success: true, error: null} | {success: false, error: string}> {
    const user = (await getUser())?.user;
    const user_id = user?.sub;

    if (!user_id) return { success: false, error: "Unauthenticated user." };

    try {
        await sql.transaction([
            sql `INSERT INTO user_preferences (user_id, hide_movies)
            VALUES (${user_id}, ${show})
            ON CONFLICT (user_id)
            DO UPDATE SET hide_movies = NOT user_preferences.hide_movies
            `,
        ]);
        return { success: true, error: null }
    } catch (err) {
        console.error(err);
        return { success: false, error: "hideAndShowMovies failed"}
    }
}