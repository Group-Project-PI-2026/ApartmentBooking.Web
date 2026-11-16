import { useState } from 'react'
import { generatePath, useNavigate } from 'react-router'
import { useCurrentUser } from '@/shared/auth'
import { addDays, nightsBetween, todayIso } from '@/shared/lib/date'
import { formatNights, formatPrice } from '@/shared/lib/format'
import { Button, DatePicker, Input } from '@/shared/ui'
import { useApartments, type ApartmentDetailsDto } from '../../api/apartments'
import { bookingPaths } from '../../paths'
import styles from './ApartmentPage.module.css'

interface Props {
  apartment: ApartmentDetailsDto
  initialCheckIn: string
  initialCheckOut: string
  initialGuests: string
}

export function BookingCard({ apartment, initialCheckIn, initialCheckOut, initialGuests }: Props) {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useCurrentUser()
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [guests, setGuests] = useState(initialGuests)

  const today = todayIso()
  const maxGuests = Number(apartment.maxGuests)
  const hasDates = Boolean(checkIn && checkOut)
  const nights = hasDates ? nightsBetween(checkIn, checkOut) : 0
  const guestsError =
    guests && Number(guests) > maxGuests ? `Максимум ${maxGuests} для цих апартаментів` : ''

  const availability = useApartments(
    { checkIn, checkOut, guestsCount: guestsError ? '' : guests },
    hasDates,
  )
  const match = availability.data?.find((a) => a.id === apartment.id)
  const isUnavailable = hasDates && availability.isSuccess && !match
  const total =
    match?.totalPrice != null ? Number(match.totalPrice) : nights * Number(apartment.pricePerNight)

  const changeCheckIn = (value: string) => {
    setCheckIn(value)
    if (checkOut && checkOut <= value) setCheckOut('')
  }

  const changeGuests = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    setGuests(digits ? String(Math.max(Number(digits), 1)) : '')
  }

  const canBook = hasDates && !guestsError && availability.isSuccess && Boolean(match)

  const goToBooking = () => {
    const params = new URLSearchParams({ checkIn, checkOut })
    if (guests) params.set('guests', guests)
    const target = `${generatePath(bookingPaths.checkout, { id: apartment.id })}?${params}`
    if (isAuthenticated) navigate(target)
    else void login(target)
  }

  return (
    <aside className={styles.bookingCard}>
      <h3>Перевірте доступність</h3>
      <div className={styles.bookingFields}>
        <DatePicker
          label="Заїзд"
          value={checkIn}
          onChange={changeCheckIn}
          min={today}
          rangeStart={checkIn}
          rangeEnd={checkOut}
        />
        <DatePicker
          label="Виїзд"
          value={checkOut}
          onChange={setCheckOut}
          min={addDays(checkIn || today, 1)}
          rangeStart={checkIn}
          rangeEnd={checkOut}
        />
        <Input
          label="Гості"
          inputMode="numeric"
          placeholder="Кількість гостей"
          value={guests}
          onChange={(e) => changeGuests(e.target.value)}
          error={guestsError}
        />
      </div>

      <hr className={styles.divider} />

      {hasDates ? (
        <div className={styles.summary}>
          <span className={styles.summaryLine}>
            {formatPrice(apartment.pricePerNight)} × {formatNights(nights)}
          </span>
          <span className={styles.summaryTotal}>Загальна сума {formatPrice(total)}</span>
        </div>
      ) : (
        <div className={styles.summary}>
          <span className={styles.summaryTotal}>{formatPrice(apartment.pricePerNight)} / ніч</span>
          <span className={styles.summaryLine}>Оберіть дати, щоб побачити загальну суму.</span>
        </div>
      )}

      {isUnavailable && (
        <p className={styles.unavailable}>Ці дати вже зайняті. Оберіть інші дати.</p>
      )}

      <Button fullWidth disabled={!canBook} onClick={goToBooking}>
        Перейти до бронювання
      </Button>

      {!isAuthenticated && <p className={styles.note}>Для бронювання потрібно увійти в акаунт.</p>}
    </aside>
  )
}
