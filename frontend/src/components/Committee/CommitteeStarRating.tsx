import { useState } from "react";
import { FaStar, FaRegStar, FaStarHalfStroke } from "react-icons/fa6";

interface CommitteeStarRatingProps {
  score: number;
  onChange: (newScore: number) => void;
  size?: number;
}

const CommitteeStarRating = ({ score, onChange, size = 24 }: CommitteeStarRatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  // 5 stars with half-star functionality
  return (
    <div className="flex gap-2">
      {Array.from({ length: 5 }).map((_, i) => {
        const starIndex = i + 1;
        const halfValue = starIndex - 0.5;
        const fullValue = starIndex;
        
        const displayValue = hovered ?? score;
        
        let icon;
        if (displayValue >= fullValue) {
          icon = <FaStar size={size} className="text-[#08605F]" />;
        } else if (displayValue >= halfValue) {
          icon = <FaStarHalfStroke size={size} className="text-[#08605F]" />;
        } else {
          icon = <FaRegStar size={size} className="text-[#08605F]" />;
        }

        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            {/* Left half - half star */}
            <button
              type="button"
              onMouseEnter={() => setHovered(halfValue)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChange(halfValue)}
              className="absolute left-0 top-0 w-1/2 h-full focus:outline-none transition-colors duration-100"
              style={{ zIndex: 2 }}
            />
            {/* Right half - full star */}
            <button
              type="button"
              onMouseEnter={() => setHovered(fullValue)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChange(fullValue)}
              className="absolute right-0 top-0 w-1/2 h-full focus:outline-none transition-colors duration-100"
              style={{ zIndex: 2 }}
            />
            {/* Star icon */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
              {icon}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommitteeStarRating; 