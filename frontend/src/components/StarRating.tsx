import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa6";
import type { StarRatingProps } from "../types/starRating";

const StarRating = ({ score, onChange, size = 24 }: StarRatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex gap-5">
      {[1, 2, 3, 4, 5].map((value) => {
        const isActive = hovered !== null ? value <= hovered : value <= score;

        return (
          <button
            key={value}
            type="button"
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(value)}
            className="transition-colors"
          >
            {isActive ? (
              <FaStar size={size} className="text-[#08605F]" />
            ) : (
              <FaRegStar size={size} className="text-[#08605F]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
