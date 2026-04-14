'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StockChartProps {
  data: { date: string; close: number }[];
  height?: number;
}

export default function StockChart({ data, height = 300 }: StockChartProps) {
  const [options, setOptions] = useState<any>({
    chart: {
      type: 'area',
      height: height,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
    },
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    colors: ['#00BFFF'],
    grid: {
      borderColor: '#1F1F2E',
      strokeDashArray: 4,
    },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: '#6B7280' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#6B7280' },
        formatter: (val: number) => `$${val.toFixed(2)}`,
      },
    },
    tooltip: {
      theme: 'dark',
      x: { format: 'MMM dd, yyyy' },
      y: { formatter: (val: number) => `$${val.toFixed(2)}` },
    },
    dataLabels: { enabled: false },
  });

  const series = [
    {
      name: 'Price',
      data: data.map((d) => ({ x: new Date(d.date).getTime(), y: d.close })),
    },
  ];

  return <Chart options={options} series={series} type="area" height={height} />;
}