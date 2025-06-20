import type { ChartOptions, ChartData } from 'chart.js';

export type BarChartData = ChartData<'bar', number[], string>;

export type BarChartOptions = ChartOptions<'bar'>;