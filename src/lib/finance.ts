export type ChargeState = {
  amount: number;
  paid: number;
};

export function calculateOutstandingBalance(items: ChargeState[]) {
  return items.reduce((total, item) => total + Math.max(item.amount - item.paid, 0), 0);
}

export function formatTry(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}
