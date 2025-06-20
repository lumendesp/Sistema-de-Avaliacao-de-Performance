import { FaStar, FaRegStar } from 'react-icons/fa6';

interface StarRatingReadOnlyProps {
  score: number;
  size?: number;
  dimmed?: boolean;
}

const StarRatingReadOnly = ({ score, size = 24, dimmed = false }: StarRatingReadOnlyProps) => {
  const filledColor = dimmed ? '#A7D1D0' : '#08605F';

  return (
    <div className="flex gap-7">
      {Array.from({ length: 5 }).map((_, i) => {
        const starIndex = i + 1;
        const filled = score >= starIndex;

        return filled ? (
          <FaStar key={i} size={size} className="" color={filledColor} />
        ) : (
          <FaRegStar key={i} size={size} color={filledColor} />
        );
      })}
    </div>
  );
};

export default StarRatingReadOnly;
