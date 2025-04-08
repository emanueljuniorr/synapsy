'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { DashboardData } from '@/types';

Chart.register(...registerables);

interface ProductivityChartProps {
  data: DashboardData | null;
}

export default function ProductivityChart({ data }: ProductivityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    // Destruir gráfico anterior se existir
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Calcular métricas de produtividade
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // Criar gráfico
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Concluídas', 'Pendentes'],
        datasets: [
          {
            data: [completedTasks, pendingTasks],
            backgroundColor: [
              'rgba(147, 51, 234, 0.8)',
              'rgba(156, 163, 175, 0.2)'
            ],
            borderColor: [
              'rgb(147, 51, 234)',
              'rgb(156, 163, 175)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgb(156, 163, 175)',
              padding: 20
            }
          }
        },
        cutout: '70%'
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="w-full h-[200px]">
      <canvas ref={chartRef} />
    </div>
  );
} 