import React from 'react';
import { Line } from 'react-chartjs-2';
import './ChartSetup';

const RevenueChart = ({ data = [] }) => {
  const labels = data.map((d) => d.month);
  const revenues = data.map((d) => d.revenue);
  const newMembers = data.map((d) => d.newMembers);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Monthly Revenue ($)',
        data: revenues,
        borderColor: '#C9A15A',
        backgroundColor: 'rgba(201, 161, 90, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#C9A15A',
        pointBorderColor: '#18170F',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointRadius: 4,
        yAxisID: 'y',
      },
      {
        label: 'New Member Signups',
        data: newMembers,
        borderColor: '#4FD1C5',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        tension: 0.3,
        pointBackgroundColor: '#4FD1C5',
        pointBorderColor: '#18170F',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointRadius: 3,
        yAxisID: 'y1',
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
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
        },
        ticks: { font: { size: 10, family: 'monospace' }, color: '#6B7280' },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
        },
        ticks: {
          callback: (value) => `$${value}`,
          font: { size: 10, family: 'monospace' },
          color: '#6B7280',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: { font: { size: 10, family: 'monospace' }, color: '#4FD1C5' },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          font: { size: 11 },
          color: '#94A3B8',
        },
      },
    },
  };

  return (
    <div className="w-full h-72">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;
