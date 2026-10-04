// Valores apenas para prévia visual. Não são metas nutricionais personalizadas.
export const demoMacros = [
  { name: 'Proteína', consumed: 112, goal: 160, color: '#D6F582', symbol: 'P' },
  { name: 'Gordura', consumed: 42, goal: 65, color: '#EFC4A0', symbol: 'G' },
  { name: 'Carbo', consumed: 186, goal: 250, color: '#C5BAF3', symbol: 'C' },
] as const;
export const demoWaterGoal = 2500;
export function liters(ml: number) {
  return (ml / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}
