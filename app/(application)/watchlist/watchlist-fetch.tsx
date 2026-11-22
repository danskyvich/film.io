import { fetchAllWatchlistMovies, getTotalNumberOfWatchlistMovies } from "@/app/features/watchlist/actions";
import WatchListPage from "@/app/features/watchlist/watchlist-page";
import { getUser } from "@/app/lib/auth/get-user";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export default async function WatchlistFetch() {
     await connection();

     const { user } = await getUser();
     if (!user) redirect("/auth/login");
    
    const [totalMovieCount, result] = await Promise.all([
      getTotalNumberOfWatchlistMovies(),
      fetchAllWatchlistMovies(),
    ]);

    if (!result.success) return <p role="alert">{result.error}</p>;

    // pagination here
    const rows = result.response;

    const hasMore = rows.length > 6;
    const slice = rows.slice(0,6);
    const last = slice[slice.length - 1];

    const nextCursor = hasMore && last ? 
      { created_at: last.created_at, movie_id: last.id} :
      null;

    return (
      <WatchListPage
        cursor={nextCursor}
        count={totalMovieCount}
        movies={slice}
      />
    );
}