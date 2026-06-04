export const DISCOUNT_OPTIONS = [
  0,
  ...Array.from({ length: 14 }, (_, i) => (i + 1) * 5),
];

export function computeSaleTotal(unitPrice, discountPercent) {
  const price = Number(unitPrice) || 0;
  const discount = Number(discountPercent) || 0;
  if (discount === 0) return price;
  return price * (1 - discount / 100);
}
