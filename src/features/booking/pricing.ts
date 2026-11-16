export const DEPOSIT_PERCENT = 50

export function paymentSplit(total: number, payInFull: boolean) {
  const payNow = payInFull ? total : Math.round((total * DEPOSIT_PERCENT) / 100)
  return { payNow, balance: total - payNow }
}
