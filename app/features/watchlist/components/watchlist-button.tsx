import { Button } from "@/components/ui/button";
import { Check, Loader2, Tv } from "lucide-react";

interface WatchlistButton {
  state: boolean;
  onClick: () => void;
  disabled: boolean;
  className?: string;
}

export default function WatchlistButton({
  state,
  onClick,
  disabled,
  className,
}: WatchlistButton) {
  return (
    <Button
      className={`${className} ${state ? "bg-yellow-400 text-black hover:bg-yellow-400/75" : "bg-transparent text-yellow-400 hover:bg-yellow-400/25"} border border-yellow-400 items-center justify-center cursor-pointer active:bg-yellow-400 active:text-black`}
      type="button"
      onClick={onClick}
      isDisabled={disabled}
    >
      {disabled ? (
        <Loader2 size={16} className="min-w-4 h-auto animate-spin" />
      ) : state ? (
        <Check size={18} className="min-w-3 h-auto" />
      ) : (
        <Tv size={18} className="min-w-3 h-auto" />
      )}
      <p>
        {disabled ? "Saving..." : state ? "In watchlist" : "Add to watchlist"}
      </p>
    </Button>
  );
}
