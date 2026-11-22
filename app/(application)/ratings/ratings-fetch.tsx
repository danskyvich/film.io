import { countTotalRatedMovies, fetchAllTotalRatedMovies } from "@/app/features/ratings/actions";
import RatingsPage from "@/app/features/ratings/ratings-page";
import { getUser } from "@/app/lib/auth/get-user";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export default async function RatingsFetch() {
    await connection();

    const { user } = await getUser();
    if (!user) redirect("/auth/login");



    // fetch data
    const [ratingsMovies, totalRatedMovieCount] = await Promise.all([
        fetchAllTotalRatedMovies(),
        countTotalRatedMovies(),
    ]);

    const rows = ratingsMovies.response;
    const hasMore = rows.length > 6;
    const slice = rows.slice(0,6);
    const last = slice[slice.length - 1];

    const cursor = hasMore && last ? {
        created_at: last.created_at, movie_id: last.id
    } : null;

    return (
      <RatingsPage cursor={cursor} count={totalRatedMovieCount.count} movies={slice ?? []}/>
    );
}