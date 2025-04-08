'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { DashboardData } from '@/types';

Chart.register(...registerables);

interface ActivityChartProps {
  data: DashboardData | null;
}

export default function ActivityChart({ data }: ActivityChartProps) {
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

    // Preparar dados para o gráfico
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const lastWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const taskData = lastWeek.map(date => {
      return data.tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      }).length;
    });

    const noteData = lastWeek.map(date => {
      return data.notes.filter(note => {
        const noteDate = new Date(note.createdAt);
        return noteDate.toDateString() === date.toDateString();
      }).length;
    });

    // Criar gráfico
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Tarefas',
            data: taskData,
            borderColor: 'rgb(147, 51, 234)',
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Notas',
            data: noteData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgb(156, 163, 175)'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            },
            ticks: {
              color: 'rgb(156, 163, 175)'
            }
          },
          x: {
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            },
            ticks: {
              color: 'rgb(156, 163, 175)'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
} 