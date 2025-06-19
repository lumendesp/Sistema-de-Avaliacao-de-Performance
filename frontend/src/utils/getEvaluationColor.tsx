export const getEvaluationColor = (nota?: number): string => {
  if (nota === undefined) return 'text-gray-400';
  if (nota >= 4.5) return 'text-green-800';
  if (nota >= 4.0) return 'text-teal-600';
  if (nota >= 3.0) return 'text-yellow-600';
  return 'text-red-600';
};