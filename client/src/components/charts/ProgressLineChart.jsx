import React from 'react';
import { Line } from 'react-chartjs-2';
import './ChartSetup';

const ProgressLineChart = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-mono">
        No measurement history logged yet. Log your first check-in above!
      </div>
    );
  }

  const labels = logs.map((l) => {
    const d = new Date(l.date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const weights = logs.map((l) => l.weightKg);
  const bodyFats = logs.map((l) => l.bodyFatPercentage || null);
  const benchLifts = logs.map((l) => l.benchPressMaxKg || null);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Body Weight (kg)',
        data: weights,
        borderColor: '#4FD1C5',
        backgroundColor: 'rgba(79, 209, 197, 0.1)',
        tension: 0.3,
        fill: false,
        pointBackgroundColor: '#4FD1C5',
        pointBorderColor: '#18170F',
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: 'y',
      },
      {
        label: 'Body Fat (%)',
        data: bodyFats,
        borderColor: '#FF4B2B',
        backgroundColor: 'transparent',
        tension: 0.3,
        pointBackgroundColor: '#FF4B2B',
        pointBorderColor: '#18170F',
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: 'y1',
      },
      {
        label: 'Bench Press Max (kg)',
        data: benchLifts,
        borderColor: '#6FBE8C',
        borderDash: [4, 4],
        tension: 0.3,
        pointBackgroundColor: '#6FBE8C',
        pointBorderColor: '#18170F',
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: 'y',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { font: { size: 10, family: 'monospace' }, color: '#6B7280' },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Weight / Strength (kg)', color: '#94A3B8', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { font: { size: 10, family: 'monospace' }, color: '#6B7280' },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Body Fat (%)', color: '#FF4B2B', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        ticks: { font: { size: 10, family: 'monospace' }, color: '#FF4B2B' },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 10, font: { size: 11 }, color: '#94A3B8' },
      },
    },
  };

  return (
    <div className="w-full h-72">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProgressLineChart;
