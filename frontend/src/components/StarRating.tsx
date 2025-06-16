import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa6";

type StarRatingProps = {
  score: number;
  onChange: (newScore: number) => void;
  size?: number;
};

const StarRating = ({ score, onChange, size = 24 }: StarRatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex gap-7">
      {Array.from({ length: 5 }).map((_, i) => {
        const starIndex = i + 1;
        const filled = (hovered ?? score) >= starIndex;

        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(starIndex)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(starIndex)}
            className="focus:outline-none transition-colors duration-100"
          >
            {filled ? (
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
