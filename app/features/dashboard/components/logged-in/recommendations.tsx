import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { MovieItem } from "@/types";
import Image from "next/image";

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
          {movies.map((movies) => (
            <CarouselItem
              key={movies.id}
              className="pl-5 basis-1/4 md:basis-1/5 lg:basis-1/7"
            >
              <div className="relative h-65 cursor-pointer overflow-hidden border border-white/35">
                <Image
                  src={movies.poster_path ?? ""}
                  alt={movies.title}
                  fill
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
