"use client"

import { MovieFull, MoviePerson, Rating } from "@/types";
import { ArrowUpRight, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import WatchlistButton from "../../watchlist/components/watchlist-button";
import { useEffect, useOptimistic, useTransition } from "react";
import { addMovieToWatchlist, deleteMovieFromWatchlist } from "../../watchlist/actions";
import RatingsButton from "../../ratings/components/ratings-button";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { addRating, deleteRating } from "../../ratings/actions";
import Link from "next/link"

interface MoviePageProps {
  movie: MovieFull;
  inWatchlist: boolean;
  inRatings: boolean;
  user: string | undefined;
  rating: number;
  cast: MoviePerson[];
}

export default function MoviePage({movie, cast, rating, inWatchlist, user, inRatings}: MoviePageProps) {

    useEffect(() => {
        document.title = `${movie.title} | Film.io`
    })

    console.log(rating)

    const [optimistic, setOptimistic] = useOptimistic(
        inWatchlist,
        (_current, next: boolean) => next,
    )
    const [optimisticRatings, setOptimisticRatings] = useOptimistic(
        inRatings,
        (_current, next: boolean) => next,
      )
    const [isPending, startTransition] = useTransition();

    const handleWatchlistToggle = () => {
        startTransition(async() => {
            const next = !optimistic;
            setOptimistic(next);

            try {
                const result = next ? await addMovieToWatchlist(String(movie.id)) : await deleteMovieFromWatchlist(String(movie.id));
                if (!result.success) {
                    console.error(result.error);
                }
            } catch (err) {
                console.error(err);
            }
        })
    }

    const handleAddRating = async (
      rating: number,
    ): Promise<{ success: boolean }> => {
      try {
        const response = await addRating(rating as Rating, String(movie.id));

        if (!response.success) {
          console.error(response.error);
          return { success: false };
        }

        startTransition(() => setOptimisticRatings(true));
        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false };
      }
    };

    const handleRemoveRating = async (): Promise<{ success: boolean }> => {
      try {
        const response = await deleteRating(String(movie.id));

        if (!response.success) {
          console.error(response.error);
          return { success: false };
        }

        startTransition(() => setOptimisticRatings(false)); // false, not true
        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false };
      }
    };
    
    return (
      <main className="flex flex-col w-full h-full overflow-y-auto overflow-x-hidden py-5">
        <div className="relative w-full h-[50dvh] shrink-0">
          <Image
            src={movie.poster_path!}
            alt={`${movie.title}-poster-image`}
            fill
            sizes={"(max-width: 100vw)"}
            className="rounded-xl shadow-xl object-cover"
          />
          <div className="inset-0 absolute bg-linear-180 from-transparent to-black/75 z-50" />
        </div>

        {/* Content */}
        <section className="flex flex-col w-full px-[5dvw] sm:px-[10dvw] xl:px-[25dvw] mt-10">
          {/* header */}
          <article className="flex flex-col w-full gap-5">
            <div className="w-full h-fit">
              {/* Header */}
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col">
                  <h1 className="font-semibold text-2xl lg:text-4xl font-sans">
                    {movie.title}
                  </h1>
                  <div className="flex w-fit text-sm text-white/50 font-semibold font-sans gap-3">
                    <p>{movie.release_date}</p>•<p>{movie.origin_country}</p>•
                    <p>{movie.runtime} mins</p>
                  </div>
                </div>

                {/* Subbar details */}
                <div className="flex gap-2">
                  <Star size={18} className="text-yellow-400 min-w-4 h-auto" />
                  <p className="text-sm text-white/75 font-light">
                    {Math.floor(movie.vote_average)}/10
                  </p>
                </div>
              </div>

              {/* Description */}
              <h2 className="font-normal tracking-tight text-md font-sans mt-3 text-white/75 min-w-fit max-w-[60%]">
                {movie.overview}
              </h2>
            </div>
          </article>

          {/* Genre bar */}
          <article className="flex border-white/25 gap-3 mt-3">
            {movie.genres.map((genre, id) => (
              <p
                key={id}
                className="rounded-lg text-sm font-semibold bg-purple-400 text-black px-2 py-1"
              >
                {genre}
              </p>
            ))}
          </article>

          {/* Movie information */}
          <section className="flex flex-col w-full min-h-fit mt-5">
            {/* Header */}
            <div className="flex w-full justify-between items-center">
              <h2 className="text-white/75 font-semibold font-sans text-xl">
                Movie information
              </h2>
              {movie.homepage !== null && (
                <Link
                  href={movie.homepage}
                  className="text-sm block flex items-center justify-center gap-1 hover:bg-slate-200/10 py-2 px-3 rounded-xl"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <p>Visit homepage</p>
                  <ChevronRight size={18} className="" />
                </Link>
              )}
            </div>

            {/* Production companies */}
            <div className="flex flex-col w-full min-h-fit h-20 border border-white/25 rounded-lg p-2 mt-2">
              <h2 className="font-sans text-sm md:text-lg font-semibold">
                Production companies
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-3 w-full h-fit gap-3 mt-3">
                {movie.production_companies.map((company) => {
                  console.log(company.logo_path);
                  return (
                    <div
                      className="relative w-fit items-center gap-3 flex"
                      key={company.id}
                    >
                      {company.logo_path && (
                        <div className="relative shrink-0 w-16 h-10 rounded-md bg-white/90">
                          <Image
                            src={company.logo_path}
                            alt={`${company.name} logo`}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        </div>
                      )}

                      <p className="flex w-fit h-fit text-sm lg:text-[0.95rem] line-clamp-1">
                        {company.name}
                      </p>
                      {company.origin_country && (
                        <p className="text-sm lg:text-[0.95rem] text-white/50 line-clamp-1">
                          {/* use transformCodesToCountry */}
                          {company.origin_country}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cast */}
            <div className="flex w-full flex-col min-h-fit my-5 border border-white/25 rounded-md p-3">
              <h2 className="font-sans text-sm md:text-lg font-semibold">
                Cast
              </h2>

              <div className="flex w-full h-full gap-5">
                {cast.map((person) => (
                  <div
                    className="relative w-full h-full rounded-xl"
                    key={person.id}
                  >
                    {person.profile_path !== null && (
                      <div className="flex flex-col w-full overflow-x-auto gap-1 mt-3 pb-2">
                        <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl">
                          <Image
                            src={person.profile_path!}
                            alt={`${person.name}'s portrait`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="flex h-full text-sm wrap-normal">{person.name}</h3>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {user ? (
            <div className="flex flex-col border border-yellow-400/25 rounded-xl sm:flex-row p-2 gap-3 w-full h-fit">
              <WatchlistButton
                state={optimistic}
                disabled={isPending}
                onClick={handleWatchlistToggle}
              />
              <RatingsButton
                rating={rating}
                state={optimisticRatings}
                onConfirm={handleAddRating}
                onRemove={handleRemoveRating}
                disabled={isPending}
                isRated={inRatings}
              />
            </div>
          ) : (
            <div className="flex border border-yellow-400/25 rounded-xl sm:flex-row p-2 gap-3 w-full h-fit mt-2 items-center justify-center">
              <Button
                className="flex border border-yellow-400 px-5 hover:bg-yellow-400/25 cursor-pointer"
                onClick={() => redirect("/auth/login")}
              >
                <ArrowUpRight
                  size={18}
                  className="text-yellow-400 min-w-4 h-auto"
                />
                <p className="text-sm text-yellow-400">Sign in</p>
              </Button>
              <p className="text-sm text-yellow-400 font-light">
                to rate and add them to your watchlist.
              </p>
            </div>
          )}
        </section>
      </main>
    );
}