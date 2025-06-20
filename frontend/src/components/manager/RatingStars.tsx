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

  // Função para detectar clique na metade esquerda/direita
  const handleStarClick = (e: React.MouseEvent, star: number) => {
    if (readOnly || !onChange) return;
    const { left, width } = (e.target as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - left;
    if (clickX < width / 2) {
      onChange(star - 0.5);
    } else {
      onChange(star);
    }
  };

  return (
    <div className="flex space-x-4">
      {stars.map((star) => {
        const isFull = value >= star;
        const isHalf = value >= star - 0.5 && value < star;
        return (
          <span
            key={star}
            style={{ position: "relative", display: "inline-block" }}
          >
            <Star
              size={size}
              fill={
                isFull ? "#0F766E" : isHalf ? "url(#half-gradient)" : "none"
              }
              stroke="#0F766E"
              className={`cursor-pointer ${
                readOnly ? "pointer-events-none opacity-70" : ""
              }`}
              onClick={(e) => handleStarClick(e, star)}
              style={{ zIndex: 1 }}
            />
            {/* SVG gradient para meia estrela */}
            {isHalf && (
              <svg
                width={size}
                height={size}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                }}
              >
                <defs>
                  <linearGradient
                    id="half-gradient"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="0"
                  >
                    <stop offset="50%" stopColor="#0F766E" />
                    <stop offset="50%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <Star size={size} fill="url(#half-gradient)" stroke="none" />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
}
