export function calcProfit(
  salePrice: number,
  cost: number,
  commission = 0,
): number {
  return salePrice - cost - (Number.isFinite(commission) ? commission : 0);
}

export function calcMargin(
  salePrice: number,
  cost: number,
  commission = 0,
): number {
  if (cost === 0) return 0;
  return (calcProfit(salePrice, cost, commission) / cost) * 100;
}

export function formatMargin(
  salePrice: number,
  cost: number,
  commission = 0,
): string {
  return `${Math.round(calcMargin(salePrice, cost, commission))}%`;
}
