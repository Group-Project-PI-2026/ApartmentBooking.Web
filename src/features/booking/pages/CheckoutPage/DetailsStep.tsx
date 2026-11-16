import { useState, type FormEvent } from 'react'
import { ApiError } from '@/shared/api'
import { useCurrentUser } from '@/shared/auth'
import { formatGuests, formatPrice } from '@/shared/lib/format'
import { Button, Checkbox, InfoMessage, Input, RadioCard, Select, Status } from '@/shared/ui'
import { useReserveBooking } from '../../api/bookings'
import { DEPOSIT_PERCENT, paymentSplit } from '../../pricing'
import styles from './CheckoutPage.module.css'

interface Props {
  apartmentId: string
  checkIn: string
  checkOut: string
  maxGuests: number
  guests: number
  onGuestsChange: (value: number) => void
  total: number
  payInFull: boolean
  onPayInFullChange: (value: boolean) => void
}

interface GuestForm {
  firstName: string
  lastName: string
  email: string
  phone: string
}

const REQUIRED = 'Поле обов’язкове'
const PHONE_PATTERN = /^\+380\d{9}$/

const cancellationTerms = [
  'Понад 7 діб до заїзду — повне повернення сплаченої суми.',
  'Понад 24 години й до 7 діб включно — утримання 10% загальної вартості бронювання.',
  'За 24 години або менше до заїзду — без повернення коштів.',
]

function validate(form: GuestForm) {
  const errors: Partial<Record<keyof GuestForm, string>> = {}
  if (!form.firstName.trim()) errors.firstName = REQUIRED
  if (!form.lastName.trim()) errors.lastName = REQUIRED
  if (!form.email.trim()) errors.email = REQUIRED
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Вкажіть коректну адресу'
  const phone = form.phone.replace(/[\s()-]/g, '')
  if (!phone) errors.phone = REQUIRED
  else if (!PHONE_PATTERN.test(phone)) errors.phone = 'Формат: +380 XX XXX XX XX'
  return errors
}

export function DetailsStep({
  apartmentId,
  checkIn,
  checkOut,
  maxGuests,
  guests,
  onGuestsChange,
  total,
  payInFull,
  onPayInFullChange,
}: Props) {
  const { profile } = useCurrentUser()
  const reserve = useReserveBooking()
  const [form, setForm] = useState<GuestForm>({
    firstName: profile?.given_name ?? '',
    lastName: profile?.family_name ?? '',
    email: profile?.email ?? '',
    phone: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof GuestForm, string>>>({})
  const [agreed, setAgreed] = useState(false)
  const [agreeError, setAgreeError] = useState(false)

  const deposit = paymentSplit(total, false)
  const full = paymentSplit(total, true)
  const payNow = payInFull ? full.payNow : deposit.payNow

  const set = (patch: Partial<GuestForm>) => {
    setForm((f) => ({ ...f, ...patch }))
    setErrors((e) => {
      const next = { ...e }
      for (const key of Object.keys(patch)) delete next[key as keyof GuestForm]
      return next
    })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    setAgreeError(!agreed)
    if (Object.keys(nextErrors).length > 0 || !agreed) return

    reserve.mutate(
      { apartmentId, checkIn, checkOut, guestsCount: guests, payInFull },
      { onSuccess: (data) => window.location.assign(data.checkoutUrl) },
    )
  }

  const status = reserve.error instanceof ApiError ? reserve.error.status : null
  const reserveError =
    status === 409
      ? 'Ці дати вже зайняті або тимчасово зарезервовані. Оберіть інші дати.'
      : status === 502
        ? 'Платіжний сервіс тимчасово недоступний. Спробуйте пізніше.'
        : reserve.error
          ? 'Не вдалося створити бронювання. Спробуйте ще раз.'
          : ''

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <section className={styles.card}>
        <h2>Дані гостя</h2>
        <Status tone="success" className={styles.verified}>
          Особу підтверджено
        </Status>
        <div className={styles.fields}>
          <Input
            label="Ім’я"
            value={form.firstName}
            onChange={(e) => set({ firstName: e.target.value })}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <Input
            label="Прізвище"
            value={form.lastName}
            onChange={(e) => set({ lastName: e.target.value })}
            error={errors.lastName}
            autoComplete="family-name"
          />
          <Input
            label="Електронна пошта"
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Номер телефону"
            type="tel"
            placeholder="+380 XX XXX XX XX"
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            error={errors.phone}
            autoComplete="tel"
          />
          <Select
            label="Кількість гостей"
            options={Array.from({ length: maxGuests }, (_, i) => ({
              value: String(i + 1),
              label: formatGuests(i + 1),
            }))}
            value={String(guests)}
            onChange={(e) => onGuestsChange(Number(e.target.value))}
          />
        </div>
      </section>

      <section className={styles.card}>
        <h2>Спосіб оплати</h2>
        <div className={styles.options}>
          <RadioCard
            name="payment"
            label={`Передоплата ${DEPOSIT_PERCENT}%`}
            description={`Зараз ${formatPrice(deposit.payNow)} · залишок ${formatPrice(deposit.balance)}`}
            checked={!payInFull}
            onChange={() => onPayInFullChange(false)}
          />
          <RadioCard
            name="payment"
            label="Повна оплата"
            description={`Зараз ${formatPrice(full.payNow)} · залишок ${formatPrice(full.balance)}`}
            checked={payInFull}
            onChange={() => onPayInFullChange(true)}
          />
        </div>
        <p className={styles.hint}>Залишок сплачується в день заселення.</p>
      </section>

      <section className={styles.card}>
        <h2>Сповіщення</h2>
        <div className={styles.channel}>
          <span className={styles.channelTitle}>Email</span>
          <span className={styles.hint}>Підтвердження надійде на пошту.</span>
        </div>
        <p className={styles.muted}>Підтвердження бронювання надійде на email.</p>
      </section>

      <section className={styles.card}>
        <h2>Умови скасування бронювання</h2>
        <div className={styles.terms}>
          {cancellationTerms.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </section>

      <Checkbox
        label="Я погоджуюся з умовами бронювання та скасування"
        checked={agreed}
        invalid={agreeError}
        onChange={(e) => {
          setAgreed(e.target.checked)
          setAgreeError(false)
        }}
      />
      {agreeError && <span className={styles.error}>Потрібна ваша згода з умовами</span>}

      {reserveError && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          {reserveError}
        </InfoMessage>
      )}

      <div className={styles.submit}>
        <Button type="submit" className={styles.payButton} disabled={reserve.isPending}>
          Перейти до оплати · {formatPrice(payNow)}
        </Button>
        <span className={styles.hint}>Оплата на сторінці платіжного сервісу</span>
      </div>
    </form>
  )
}
