import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import './ChartSetup';

const PlanDoughnutChart = ({ planDistribution = {} }) => {
  const labels = Object.keys(planDistribution);
  const dataValues = Object.values(planDistribution);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: [
          '#4FD1C5', // Basic (Teal)
          '#94A3B8', // Silver (Slate)
          '#C9A15A', // Gold (Gold)
          '#A78BFA', // Platinum (Purple)
          '#6FBE8C', // VIP (Emerald)
        ],
        borderColor: '#18170F',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 8,
          padding: 12,
          font: { size: 10 },
          color: '#94A3B8',
        },
      },
    },
  };

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default PlanDoughnutChart;
