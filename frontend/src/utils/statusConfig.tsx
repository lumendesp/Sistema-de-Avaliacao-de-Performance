import { ReactNode } from 'react';
import type { EvaluationStatus } from '../types/evaluationStatusButton';

type StatusData = {
  bg: string;
  text: string;
  subtitle: (dias?: number) => ReactNode;
  iconColor: string;
  textColor: string;
};

export const statusConfig: Record<EvaluationStatus, StatusData> = {
  aberto: {
    bg: 'bg-green-main',
    text: 'text-white',
    subtitle: (dias = 0) => (
      <>
        <span className="font-bold">{dias} dia{dias === 1 ? '' : 's'}</span>{' '}
        restante{dias === 1 ? '' : 's'}
      </>
    ),
    iconColor: 'text-white',
    textColor: 'text-white',
  },
  emBreve: {
    bg: 'bg-white border border-gray-300',
    text: 'text-gray-main',
    subtitle: () => (
      <>
        Resultados <span className="font-bold">disponíveis</span>{' '}
        <span className="font-bold">em breve</span>
      </>
    ),
    iconColor: 'text-gray-main',
    textColor: 'text-gray-main',
  },
  disponivel: {
    bg: 'bg-white border border-gray-300',
    text: 'text-teal-900',
    subtitle: () => (
      <>
        Resultados <span className="font-bold">disponíveis</span>
      </>
    ),
    iconColor: 'text-teal-900',
    textColor: 'text-teal-900',
  },
};