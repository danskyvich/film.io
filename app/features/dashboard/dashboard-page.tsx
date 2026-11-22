"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { User } from "@auth0/nextjs-auth0/types";
import ContentRow from "./components/content-rows";
import { AggregatedGenres, MovieItem } from "@/types";
import Thumbnail from "./components/thumbnail";
import ThumbnailSkeleton from "./components/skeleton/thumbnail-skeleton";
import { FEATURED } from "@/types";
import Link from "next/link";
interface DashboardProps {
  user: User | undefined,
  trending: MovieItem[],
  topRated: MovieItem[],
  perGenre: Record<string, AggregatedGenres[]>,
  recommendations?: MovieItem[],
}

export default function DashboardPage({user, trending, recommendations, topRated, perGenre}: DashboardProps) {

  useEffect(() => {
    document.title = "Film.io - Home";
  }, []);

  // for the trending carousel (the first carousel)
  const [pickedItem, setPickedItem] = useState<MovieItem | null>(null);

  // Defaults to the first trending movie until the user clicks one
  const selectedItem = pickedItem ?? trending[0] ?? null;

  return (
    <main className="flex flex-col z-0 w-full h-full gap-5 overflow-y-auto overflow-x-hidden">
      {/* Trending Now! */}
      <section className="flex flex-col w-full h-fit">
        <Suspense fallback={<ThumbnailSkeleton />}>
          {/* Thumbnail */}
          <Thumbnail selectedItem={selectedItem} />
        </Suspense>

        {/* Carousel */}
        <Carousel
          orientation="horizontal"
          opts={{
            align: "start",
          }}
          className="mx-3"
        >
          <CarouselContent>
            {trending.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-1/3 md:basis-1/5 lg:basis-1/6 cursor-pointer"
                onClick={() => setPickedItem(item)}
              >
                <div className="relative aspect-2/3 overflow-hidden rounded-lg">
                  <Image
                    src={item.poster_path!}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Toprated */}
      {user && (
        <section className="flex flex-col w-full h-fit mx-3">
          <ContentRow
            title="Recommended for you"
            subtitle="Movies catered to your taste"
            movies={recommendations!}
          />
        </section>
      )}

      {/* Toprated */}
      <section className="flex flex-col w-full h-fit mx-3">
        <ContentRow
          title="Top rated"
          subtitle="Movies that users rated the most"
          movies={topRated}
        />
      </section>

      <section className="flex flex-col w-full h-fit mx-3 gap-4">
        {FEATURED.filter(Boolean)
          .slice(0, 5)
          .map((genre) => (
            <div className="space-y-3" key={genre}>
              <h2 className="text-2xl font-semibold">{genre}</h2>
              <Carousel orientation="horizontal" opts={{ align: "start" }}>
                <CarouselContent>
                  {(perGenre[genre] ?? []).map((movie) => (
                    <CarouselItem
                      key={movie.id}
                      className="basis-1/3 md:basis-1/5 lg:basis-1/6"
                    >
                      <Link
                        href={`/dashboard/${movie.id}`}
                        draggable={false}
                        className="block relative isolate aspect-2/3 overflow-hidden rounded-lg w-full h-full"
                      >
                        {movie.poster_path && (
                          <Image
                            src={movie.poster_path}
                            alt={movie.title}
                            fill
                            sizes="(min-width: 1024px) 16vw, (min-width: 768px) 20vw, 33vw"
                            className="object-cover"
                          />
                        )}
                        <div className="flex w-full h-full bg-linear-180 from-transparent to-black/90 absolute inset-0 pointer-events-none">
                          <p className="text-sm font-sans self-end p-2">
                            {movie.title}
                          </p>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          ))}
      </section>
    </main>
  );
}
