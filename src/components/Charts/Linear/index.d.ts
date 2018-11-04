import * as React from 'react';
export interface IlinearChartProps {
  data: Array<{
    x: string;
    y1: string;
    y2: string;
  }>;
  titleMap: { y1: string; y2: string };
  padding?: [number, number, number, number];
  height?: number;
  style?: React.CSSProperties;
}

export default class LinearChart extends React.Component<IlinearChartProps, any> {}
