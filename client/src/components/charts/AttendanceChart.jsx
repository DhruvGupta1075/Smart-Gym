import React from 'react';
import { Bar } from 'react-chartjs-2';
import './ChartSetup';

const AttendanceChart = ({ hourlyData = [], type = 'hourly', trendData = [] }) => {
  let labels = [];
  let counts = [];

  if (type === 'hourly') {
    labels = hourlyData.map((d) => d.hour);
    counts = hourlyData.map((d) => d.checkIns);
  } else {
    labels = trendData.map((d) => d.label);
    counts = trendData.map((d) => d.count);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: type === 'hourly' ? 'Peak Check-Ins by Hour' : 'Daily Attendance Count',
        data: counts,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, '#4FD1C5');
          gradient.addColorStop(1, 'rgba(79, 209, 197, 0.15)');
          return gradient;
        },
        borderRadius: 6,
        hoverBackgroundColor: '#38B2AC',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, family: 'monospace' }, color: '#6B7280' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 10, family: 'monospace' }, color: '#6B7280' },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default AttendanceChart;
