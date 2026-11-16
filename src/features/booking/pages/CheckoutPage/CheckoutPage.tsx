import { useState } from 'react'
import { generatePath, Navigate, useParams, useSearchParams } from 'react-router'
import { nightsBetween } from '@/shared/lib/date'
import { BookingSteps, Container, Loader } from '@/shared/ui'
import { useApartment, useApartments } from '../../api/apartments'
import { BookingSummary } from '../../components/BookingSummary/BookingSummary'
import { isIdentityVerified } from '../../identity'
import { bookingPaths } from '../../paths'
import { paymentSplit } from '../../pricing'
import { DetailsStep } from './DetailsStep'
import { IdentityStep } from './IdentityStep'
import styles from './CheckoutPage.module.css'

const steps = ['Перевірка особи', 'Дані й оплата', 'Підтвердження']

export function CheckoutPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const checkIn = params.get('checkIn') ?? ''
  const checkOut = params.get('checkOut') ?? ''

  const [step, setStep] = useState(() => (isIdentityVerified() ? 2 : 1))
  const [payInFull, setPayInFull] = useState(false)

  const apartment = useApartment(id)
  const maxGuests = Number(apartment.data?.maxGuests ?? 1)
  const [guestsValue, setGuests] = useState(() => Number(params.get('guests')) || 1)
  const guests = Math.min(Math.max(guestsValue, 1), maxGuests)

  const availability = useApartments(
    { checkIn, checkOut, guestsCount: String(guests) },
    Boolean(checkIn && checkOut),
  )

  const apartmentHref = generatePath(bookingPaths.apartment, { id })

  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return <Navigate to={apartmentHref} replace />
  }

  if (apartment.isLoading) {
    return (
      <Container className={styles.page}>
        <Loader />
      </Container>
    )
  }

  if (!apartment.data) return <Navigate to={apartmentHref} replace />

  const nights = nightsBetween(checkIn, checkOut)
  const pricePerNight = Number(apartment.data.pricePerNight)
  const match = availability.data?.find((a) => a.id === id)
  const total = match?.totalPrice != null ? Number(match.totalPrice) : nights * pricePerNight
  const { payNow, balance } = paymentSplit(total, payInFull)

  return (
    <Container className={styles.page}>
      <BookingSteps steps={steps} current={step} />

      <div className={styles.intro}>
        <h1>{step === 1 ? 'Підтвердьте особу' : 'Оформлення бронювання'}</h1>
        {step === 1 && (
          <p className={styles.lead}>
            Для завершення бронювання необхідно підтвердити особу. Якщо ваші дані вже підтверджені,
            повторна перевірка не потрібна.
          </p>
        )}
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          {step === 1 ? (
            <IdentityStep apartmentHref={apartmentHref} onVerified={() => setStep(2)} />
          ) : (
            <DetailsStep
              apartmentId={id}
              apartmentTitle={apartment.data.title}
              districtName={apartment.data.districtName}
              checkIn={checkIn}
              checkOut={checkOut}
              maxGuests={maxGuests}
              guests={guests}
              onGuestsChange={setGuests}
              total={total}
              payInFull={payInFull}
              onPayInFullChange={setPayInFull}
            />
          )}
        </div>
        <BookingSummary
          title={apartment.data.title}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          nights={nights}
          pricePerNight={pricePerNight}
          total={total}
          payNow={payNow}
          balance={balance}
        />
      </div>
    </Container>
  )
}
