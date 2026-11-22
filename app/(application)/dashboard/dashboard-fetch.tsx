import DashboardPage from "@/app/features/dashboard/dashboard-page";
import {
  fetchMoviesPerGenre,
  fetchRecommendations,
  fetchTopRatedMovies,
  fetchTrendingMovies,
  readRatedWatchlistedMovieIds,
} from "@/app/features/dashboard/queries";
import { auth0 } from "@/app/lib/auth/actions";
import { connection } from "next/server";

export default async function DashboardFetch() {
    await connection();
    const [trending, topRated, recommendations, perGenre, session, ratedWatchlistMovieIds] =
      await Promise.all([
        fetchTrendingMovies(),
        fetchTopRatedMovies(),
        fetchRecommendations(),
        fetchMoviesPerGenre(),
        auth0.getSession(),
        readRatedWatchlistedMovieIds(),
      ]);

      // returns [] if the clear rated or watchlist movies option is off.
      const moviesToBeExcluded = new Set<number>(ratedWatchlistMovieIds);

      // helper function for filtering out rated and watchlist movies
      const filterDashboardHelper = <T extends { id: number }>(
        movies: T[],
      ) => moviesToBeExcluded.size ? movies.filter((movie) => !moviesToBeExcluded.has(movie.id)) : movies;
      
      // filtered movie functions
      const perGenreVisible = Object.fromEntries(Object.entries(perGenre).map(([k, list]) => [k, filterDashboardHelper(list)]));
      const trendingVisible = filterDashboardHelper(trending);
      const topratedVisible = filterDashboardHelper(topRated);
    
      return <DashboardPage user={session?.user} recommendations={recommendations!} trending={trendingVisible} topRated={topratedVisible} perGenre={perGenreVisible}/>
}