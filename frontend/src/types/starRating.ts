export type StarRatingProps = {
  score: number;
  onChange: (newScore: number) => void;
  size?: number;
};