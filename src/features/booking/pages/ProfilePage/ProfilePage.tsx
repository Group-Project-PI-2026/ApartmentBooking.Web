import { useState, type FormEvent } from 'react'
import { consumeActionStatus, useCurrentUser } from '@/shared/auth'
import { Button, ComingSoon, InfoMessage, Input, Status } from '@/shared/ui'
import { isIdentityVerified } from '../../identity'
import { bookingPaths } from '../../paths'
import styles from './ProfilePage.module.css'

interface ProfileForm {
  firstName: string
  lastName: string
  phone: string
}

const REQUIRED = 'Обов’язкове поле'
const PHONE_PATTERN = /^\+380\d{9}$/

function validate(form: ProfileForm) {
  const errors: Partial<Record<keyof ProfileForm, string>> = {}
  if (!form.firstName.trim()) errors.firstName = REQUIRED
  if (!form.lastName.trim()) errors.lastName = REQUIRED
  const phone = form.phone.replace(/[\s()-]/g, '')
  if (!phone) errors.phone = REQUIRED
  else if (!PHONE_PATTERN.test(phone)) errors.phone = 'Формат: +380 XX XXX XX XX'
  return errors
}

export function ProfilePage() {
  const { profile, runAccountAction } = useCurrentUser()
  const [passwordStatus] = useState(consumeActionStatus)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<ProfileForm>({ firstName: '', lastName: '', phone: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({})
  const [notice, setNotice] = useState<'save' | 'identity' | null>(null)

  const firstName = profile?.given_name ?? ''
  const lastName = profile?.family_name ?? ''
  const email = profile?.email ?? ''
  const verified = isIdentityVerified()

  const startEditing = () => {
    setForm({ firstName, lastName, phone: '' })
    setErrors({})
    setNotice(null)
    setEditing(true)
  }

  const set = (patch: Partial<ProfileForm>) => {
    setForm((f) => ({ ...f, ...patch }))
    setErrors((e) => {
      const next = { ...e }
      for (const key of Object.keys(patch)) delete next[key as keyof ProfileForm]
      return next
    })
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setNotice('save')
  }

  const changePassword = () => runAccountAction('UPDATE_PASSWORD', bookingPaths.profile)

  if (editing) {
    return (
      <div className={styles.page}>
        <h1>Редагувати профіль</h1>
        <form className={styles.card} onSubmit={save} noValidate>
          <div className={styles.cardHeader}>
            <h2>Особисті дані</h2>
            <ComingSoon />
          </div>
          <div className={styles.fields}>
            <Input
              label="Ім’я *"
              value={form.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <Input
              label="Прізвище *"
              value={form.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
              error={errors.lastName}
              autoComplete="family-name"
            />
            <Input
              label="Телефон *"
              type="tel"
              placeholder="+380 XX XXX XX XX"
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value })}
              error={errors.phone}
              autoComplete="tel"
            />
          </div>
          <div className={styles.readonly}>
            <span className={styles.label}>Електронна пошта</span>
            <span>{email}</span>
          </div>
          {notice === 'save' && (
            <InfoMessage tone="warning" title="Збереження профілю — незабаром">
              Бекенд поки не підтримує зміну особистих даних. Зміни не збережено.
            </InfoMessage>
          )}
          <div className={styles.actions}>
            <Button type="submit" className={styles.action}>
              Зберегти зміни
            </Button>
            <Button variant="secondary" className={styles.action} onClick={() => setEditing(false)}>
              Скасувати
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1>Профіль</h1>

      {passwordStatus === 'success' && (
        <InfoMessage tone="success" title="Пароль змінено">
          Новий пароль збережено.
        </InfoMessage>
      )}
      {passwordStatus === 'error' && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося змінити пароль.
        </InfoMessage>
      )}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Особисті дані</h2>
          <Button variant="secondary" className={styles.edit} onClick={startEditing}>
            Редагувати
          </Button>
        </div>
        <dl className={styles.grid}>
          <div>
            <dt className={styles.label}>Ім’я</dt>
            <dd>{firstName || '—'}</dd>
          </div>
          <div>
            <dt className={styles.label}>Прізвище</dt>
            <dd>{lastName || '—'}</dd>
          </div>
          <div>
            <dt className={styles.label}>Електронна пошта</dt>
            <dd>{email || '—'}</dd>
          </div>
          <div>
            <dt className={styles.label}>
              Телефон <ComingSoon />
            </dt>
            <dd className={styles.muted}>Не вказано</dd>
          </div>
        </dl>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Перевірка особи</h2>
          <ComingSoon />
        </div>
        <Status tone={verified ? 'success' : 'warning'} className={styles.status}>
          {verified ? 'Особу підтверджено' : 'Особу не підтверджено'}
        </Status>
        <p className={styles.muted}>
          {verified
            ? 'Дані особи підтверджені. Повторна перевірка не потрібна.'
            : 'Для оформлення бронювання потрібно підтвердити особу.'}
        </p>
        {notice === 'identity' && (
          <InfoMessage tone="warning" title="Перевірка особи — незабаром">
            Поки що особу можна підтвердити під час оформлення бронювання.
          </InfoMessage>
        )}
        {!verified && (
          <Button className={styles.action} onClick={() => setNotice('identity')}>
            Підтвердити особу
          </Button>
        )}
      </section>

      <button type="button" className={styles.link} onClick={changePassword}>
        Змінити пароль
      </button>
    </div>
  )
}
