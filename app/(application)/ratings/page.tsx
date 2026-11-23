import RatingsPage from "@/app/features/ratings/ratings-page";
import RatingsFetch from "./ratings-fetch";
import { Suspense } from "react";

export default function Ratings() {
  return <Suspense fallback={null}><RatingsFetch/></Suspense>;
};