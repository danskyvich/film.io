"use client"

import { Button } from "@/components/ui/button";
import { Check, Loader2, Star, ThumbsUp, Trash } from "lucide-react";
import { Dialog, DialogTrigger, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface RatingsButtonProps {
    state: boolean,
    onConfirm: (rating: number) => Promise<{ success: boolean }>;
    onRemove: () => Promise<{success: boolean}>;
    className?: string;
    disabled: boolean;
    isRated: boolean;
    rating: number;
}

export default function RatingsButton({
  state,
  className,
  onConfirm,
  disabled,
  onRemove,
  isRated,
  rating,
}: RatingsButtonProps) {
  const [ratingCount, setRatingCount] = useState<number>(rating ?? 0);
  const [prevRating, setPrevRating] = useState<number>(rating ?? 0);
  const [hoverCount, setHoverCount] = useState<number>(0);
  const [open, setOpen] = useState<boolean | undefined>(undefined);

  if ((rating ?? 0) !== prevRating) {
    setPrevRating(rating ?? 0);
    setRatingCount(rating ?? 0);
  }

  const MAX_STARS = 10;
  const displayValue = hoverCount || ratingCount;

  // star rating
  const stars = Array.from({ length: MAX_STARS }, (_, index) => {
    const starValue = index + 1; // distinguishes each star
    const isFilled = starValue <= displayValue; // fills each star preceding the clicked/hover star
    return (
      <button
        type="button"
        key={starValue}
        aria-label={`${starValue} out of 10`}
        onMouseEnter={() => setHoverCount(starValue)}
        onClick={() => setRatingCount(starValue)}
        className="cursor-pointer"
      >
        <Star
          size={30}
          className={`${isFilled ? "fill-yellow-400" : "fill-transparent"} min-w-5 h-auto cursor-pointer text-yellow-400 hover:fill-yellow-400/75`}
        />
      </button>
    );
  });

  // handle rating input
  const handleConfirm = async () => {
    const { success } = await onConfirm(ratingCount);
    if (success) setOpen(false);
  };

  const handleRemove = async () => {
    const { success } = await onRemove();
    if (success) setOpen(false);
  };

  // One color source per button; children inherit via currentColor
  const triggerColors = state
    ? "bg-yellow-400 text-black hover:bg-yellow-400/75"
    : "bg-transparent text-yellow-400 hover:bg-yellow-400/75 hover:text-black";

  const confirmColors = state
    ? "bg-yellow-400 text-black hover:bg-yellow-400/75"
    : "bg-transparent text-yellow-400 hover:bg-yellow-400/25";

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <Button
        type="button"
        isDisabled={disabled}
        aria-pressed={state}
        className={`${className} ${triggerColors} border border-yellow-400 cursor-pointer active:bg-yellow-400 active:text-black`}
      >
        {state ? <Check size={18} /> : <ThumbsUp size={18} />}
        <span>{state ? "Rated" : "Rate this movie"}</span>
      </Button>

      <Dialog
        isDismissable={false}
        showCloseButton={true}
        className="flex flex-col w-full h-fit z-50 rounded-lg border border-white/15 bg-slate-950"
      >
        <div className="flex flex-col w-full h-full">
          <DialogHeader className="flex flex-col tracking-tight">
            <DialogTitle className="text-sm font-semibold font-sans md:text-lg">
              Rate this movie?
            </DialogTitle>
            <p className="font-sans text-white/75 font-light">
              Rate this movie from 1 to {MAX_STARS}
            </p>
          </DialogHeader>

          <div className="flex flex-row w-full h-fit my-3 gap-5 items-center">
            <div
              className="flex w-full gap-1"
              onMouseLeave={() => setHoverCount(0)}
            >
              {stars}
            </div>
            <p className="text-sm md:text-lg whitespace-nowrap">
              <span
                className={
                  displayValue === 0
                    ? "text-white"
                    : "text-yellow-400 font-semibold"
                }
              >
                {displayValue}
              </span>
              /{MAX_STARS}
            </p>
          </div>

          <DialogFooter className="flex w-full h-fit justify-between">

            {/* Delete rating */}
            <Button
              type="button"
              isDisabled={disabled || !isRated}
              aria-label="Delete your rating"
              onClick={handleRemove}
              className="flex items-center gap-2 text-yellow-400 border border-yellow-400 rounded-md hover:bg-yellow-400/25 cursor-pointer active:bg-yellow-400 active:text-black"
            >
              <Trash size={18} />
              <span>Delete rating</span>
            </Button>

            {/* Rate this movie */}
            <Button
              type="button"
              isDisabled={disabled || ratingCount === 0}
              onClick={handleConfirm}
              aria-label="Add rating button"
              className={`${confirmColors} flex items-center gap-2 border border-yellow-400 rounded-md cursor-pointer active:bg-yellow-400 active:text-black`}
            >
              {disabled ? (
                <Loader2 size={16} className="min-w-4 h-auto animate-spin" />
              ) : state ? (
                <Check size={18} className="min-w-3 h-auto" />
              ) : (
                <ThumbsUp size={18} className="min-w-3 h-auto" />
              )}
              <span>
                {disabled ? "Saving..." : state ? "Rated" : "Rate this movie"}
              </span>
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </DialogTrigger>
  );
}