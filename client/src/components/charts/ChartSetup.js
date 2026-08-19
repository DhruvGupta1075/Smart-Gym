import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global Chart.js defaults for dark editorial gym theme
ChartJS.defaults.color = '#94A3B8';
ChartJS.defaults.font.family = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(24, 23, 15, 0.96)';
ChartJS.defaults.plugins.tooltip.titleColor = '#F8FAFC';
ChartJS.defaults.plugins.tooltip.bodyColor = '#CBD5E1';
ChartJS.defaults.plugins.tooltip.borderColor = 'rgba(201, 161, 90, 0.3)';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.boxPadding = 6;
ChartJS.defaults.plugins.tooltip.usePointStyle = true;

