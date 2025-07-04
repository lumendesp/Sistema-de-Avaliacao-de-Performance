import React from "react";
import { Star } from "lucide-react";

interface Props {
  value?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  size?: number;
}

export default function RatingStars({
  value = 0,
  readOnly = false,
  onChange,
  size = 28, // tamanho intermediário
}: Props) {
  const stars = [1, 2, 3, 4, 5];

  // Função para detectar clique: só permite inteiro
  const handleStarClick = (e: React.MouseEvent, star: number) => {
    if (readOnly || !onChange) return;
    onChange(star);
  };

  return (
    <div className="flex space-x-4">
      {stars.map((star) => {
        const isFull = value >= star;
        return (
          <span
            key={star}
            style={{ position: "relative", display: "inline-block" }}
          >
            <Star
              size={size}
              fill={isFull ? "#0F766E" : "none"}
              stroke="#0F766E"
              className={`cursor-pointer ${
                readOnly ? "pointer-events-none opacity-70" : ""
              }`}
              onClick={(e) => handleStarClick(e, star)}
              style={{ zIndex: 1 }}
            />
          </span>
        );
      })}
    </div>
  );
}
