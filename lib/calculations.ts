export function calcProfit(salePrice: number, cost: number): number {
  return salePrice - cost;
}

export function calcMargin(salePrice: number, cost: number): number {
  if (cost === 0) return 0;
  return (calcProfit(salePrice, cost) / cost) * 100;
}

export function formatMargin(salePrice: number, cost: number): string {
  return `${Math.round(calcMargin(salePrice, cost))}%`;
}
