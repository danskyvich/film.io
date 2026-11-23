import { notFound } from "next/navigation";
import { sql } from "../db";

export const getMovieWithRatingsState = async (
  movie_id: number,
  user_id: string | undefined
): Promise<{ inRatings: boolean, data: Record<string, unknown>} | {inRatings: false, data: null}> => {
  if (!Number.isInteger(movie_id) || movie_id < 1) notFound();

  // logged-out users can't have rated anything
  if (!user_id) return { inRatings: false, data: null };

  const [row] = (await sql`
    SELECT rating FROM ratings
    WHERE user_id = ${user_id} AND movie_id = ${movie_id}
  `) as { rating: number}[];

  return { inRatings: !!row, data: row };
};