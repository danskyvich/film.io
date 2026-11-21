import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { MovieItem } from "@/types";
import Image from "next/image";
import Link from "next/link"

interface RecommendationProps {
  movies: MovieItem[],
}

interface RecommendationsProps {
  movies: MovieItem[],
}

export default function Recommendations({ movies }: RecommendationsProps) {
  return (
    <div className="flex flex-col w-full h-fit px-5">
      <Carousel
        orientation="horizontal"
        opts={{
          align: "start",
        }}
      >
        <CarouselContent className="flex -ml-5 w-full">
          {films.map((item) => (
            <CarouselItem key={item.id} className="pl-5 basis-1/4 md:basis-1/5 lg:basis-1/7">
              <div className="relative h-65 cursor-pointer overflow-hidden border border-white/35">
                <Image
                  src={movies.poster_path ?? ""}
                  alt={movies.title}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 20vw, 33vw"
                  className="object-cover"
                />

                <div className="pointer-events-none absolute inset-0 flex bg-linear-to-b from-transparent to-black transition-opacity duration-200 opacity-100">
                  <p className="self-end m-3 z-50 truncate text-sm">
                    {movie.title}
                  </p>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
