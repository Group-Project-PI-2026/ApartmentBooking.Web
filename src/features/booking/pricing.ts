import { DEPOSIT_PERCENT } from './bookingPolicy'

export { DEPOSIT_PERCENT }

// Same rounding as BookingService.ReserveAsync: Math.Round(total * DepositPercent / 100, 2)
export function paymentSplit(total: number, payInFull: boolean) {
  const payNow = payInFull ? total : Math.round(total * DEPOSIT_PERCENT) / 100
  return { payNow, balance: total - payNow }
}
