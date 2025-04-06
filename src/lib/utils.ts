import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Função para concatenar nomes de classes CSS com suporte para variantes condicionais
 * Usa clsx para processar as condições e twMerge para resolver conflitos de classes do Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data para exibição no formato brasileiro (dia/mês/ano)
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata uma data e hora para exibição no formato brasileiro (dia/mês/ano hora:minuto)
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
}

/**
 * Gera um ID único para uso em elementos temporários
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Trunca um texto para um tamanho máximo, adicionando reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Atrasa a execução por um tempo especificado (em milissegundos)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 