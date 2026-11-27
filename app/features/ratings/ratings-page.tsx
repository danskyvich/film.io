"use client"

import BrowseMoviesButton from "@/app/components/layout/browse-button";
import { MovieItem, PaginationCursor, RatingsWatchlistRow } from "@/types";
import { CircleQuestionMark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { fetchAllTotalRatedMovies } from "./actions";

interface RatingsPageProps {
  count: number;
  movies: RatingsWatchlistRow[];
  cursor: PaginationCursor | null;
}

export default function RatingsPage({count, movies, cursor}: RatingsPageProps) {

  useEffect(() => {
    document.title = "Ratings | Film.io"
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [newMovies, setMovies] = useState<MovieItem[]>(movies);
  const [newCursor, setNewCursor] = useState<PaginationCursor | null>(cursor);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    if (!newCursor || isPending) return;
    setError(null);

    startTransition(async() => {
      const response = await fetchAllTotalRatedMovies(newCursor);
      if (!response.success) {
        setError("fetchAllTotalRatedMovies failed: " + response.error);
        return;
      }

      const rows = response.response;
      const hasMore = rows.length > 6;
      const slice = rows.slice(0,6);
      const last = slice[slice.length - 1];

      setMovies((prev) => {
        const seen = new Set(prev.map((movie) => movie.id));
        return [...prev, ...slice.filter((movie) => !seen.has(movie.id))];
      })
      
      setNewCursor(hasMore && last ? { created_at: last.created_at, movie_id: last.id} : null);
    })
  }

  return (
    <main className="flex flex-col w-full h-full px-[5dvw] sm:px-[10dvw] xl:px-[20dvw] overflow-y-auto">
      {/* header */}
      <header className="mt-[10dvh] flex w-full flex-col gap-2">
        <div className="flex w-full items-end justify-between">
          <div className="flex flex-col">
            <h1 className="font-sans text-3xl font-semibold">Ratings</h1>
            <p className="text-sm text-white/75">Movies you rated.</p>
          </div>

          <p className="text-sm text-white/75">
            {count} {count === 1 ? "movie" : "movies"}
          </p>
        </div>
        <hr className="border-white/35" />
      </header>

      {/* Movies */}
      <section className="flex w-full flex-1 flex-col py-6">
        {newMovies.length === 0 ? (
          <div className="flex flex-col gap-3 w-full h-full items-center justify-center">
            <CircleQuestionMark size={30} className="h-auto text-white/50" />
            <p className="text-sm font-sans text-white/50">
              You do not have any rated movies.
            </p>
            <BrowseMoviesButton />
          </div>
        ) : (
          <article className="grid grid-cols-3 gap-x-3 gap-y-3 w-full h-full">
            {newMovies.map((movie) => (
              <Link
                href={`/dashboard/${movie.id}`}
                className="relative block aspect-2/3 w-full h-full"
                key={movie.id}
              >
                <Image
                  src={movie.poster_path! ?? ""}
                  alt={movie.title}
                  fill
                  className="rounded-lg shadow-md"
                />
                <div className="flex w-full h-full bg-linear-180 from-transparent to-black/70 z-50 absolute inset-0 ">
                  <p className="text-sm self-end p-2">{movie.title}</p>
                </div>
              </Link>
            ))}
          </article>
        )}
        {newCursor && (
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="mt-8 w-full cursor-pointer rounded-md border hover:bg-white/15 border-white/35 px-4 py-2 text-sm disabled:opacity-50 transition-all"
          >
            {isPending ? "Loading..." : "Load more"}
          </button>
        )}
      </section>
    </main>
  );
}
