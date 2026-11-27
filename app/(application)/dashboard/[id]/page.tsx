import MoviePage from "@/app/features/dashboard/movie/movie-page";
import { getMovie, retrieveMovieCast } from "@/app/features/dashboard/queries";
import { getMovieWithRatingsState } from "@/app/lib/helpers/getMovieWithRatingsState";
import { getMovieWithWatchlistState } from "@/app/lib/helpers/getMovieWithWatchlistState";
import { notFound } from "next/navigation";

export default async function MovieMain({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // retrieve params from URL

  const match = id.match(/\d+$/);
  const cleanedId = match ? Number(match[0]) : NaN;

  //validate
  if (!Number.isInteger(cleanedId) || cleanedId <= 0) notFound();

  // watchlistHelper validates the id (calls notFound() on NaN), fetches the movie and user
  const { movie, user_id, inWatchlist } = await getMovieWithWatchlistState(cleanedId, getMovie);

  // ratings
  const { inRatings, data } = await getMovieWithRatingsState(cleanedId, user_id);
  const rating = data?.rating as number;

  // casts
  const cast = await retrieveMovieCast(cleanedId);
  if (!cast.success) {
    console.error(cast.error);
    return;
  } 
  const castData = cast.data;

  return (
    <MoviePage
      cast={castData}
      rating={rating}
      movie={movie}
      inWatchlist={inWatchlist}
      user={user_id}
      inRatings={inRatings}
    />
  );
}