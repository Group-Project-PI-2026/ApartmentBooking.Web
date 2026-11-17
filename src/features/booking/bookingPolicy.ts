/**
 * Booking money rules shown to users.
 * Must match the backend "Booking" section in ApartmentBooking/appsettings.json
 * (DepositPercent, FreeCancellationDays, LateCancellationPenaltyPercent) and CancellationPolicy.cs.
 */
export const DEPOSIT_PERCENT = 30
export const FREE_CANCELLATION_DAYS = 7
export const LATE_CANCELLATION_PENALTY_PERCENT = 50

export const paymentTerm = `Передоплата ${DEPOSIT_PERCENT}% або повна оплата через зовнішній платіжний сервіс.`

export const cancellationRules = [
  {
    time: `${FREE_CANCELLATION_DAYS} діб і більше до заїзду`,
    refund: 'Повне повернення сплаченої суми',
  },
  {
    time: `Менше ніж ${FREE_CANCELLATION_DAYS} діб до заїзду`,
    refund: `Утримання ${LATE_CANCELLATION_PENALTY_PERCENT}% загальної вартості бронювання (не більше сплаченої суми)`,
  },
  { time: 'Після початку проживання', refund: 'Скасування недоступне' },
]

export const cancellationTerms = cancellationRules.map(
  (r) => `${r.time} — ${r.refund.toLowerCase()}.`,
)
