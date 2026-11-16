import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, generatePath, useNavigate } from 'react-router'
import { bookingPaths } from '@/features/booking/paths'
import { useCurrentUser } from '@/shared/auth'
import { Button, Checkbox, Container, InfoMessage, Input, Select, Textarea } from '@/shared/ui'
import { useCreateOwnerRequest, useDistricts } from '../../api/ownerRequests'
import { PhotoPicker } from '../../components/PhotoPicker/PhotoPicker'
import { propertyPaths } from '../../paths'
import {
  amenityOptions,
  guestOptions,
  propertyTypes,
  roomOptions,
  toRequest,
  validate,
  type ApplyErrors,
  type ApplyForm,
} from './applyForm'
import styles from './OwnerApplyPage.module.css'

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {children}
    </section>
  )
}

export function OwnerApplyPage() {
  const navigate = useNavigate()
  const { profile } = useCurrentUser()
  const { data: districts = [] } = useDistricts()
  const create = useCreateOwnerRequest()
  const formRef = useRef<HTMLFormElement>(null)

  const [form, setForm] = useState<ApplyForm>(() => ({
    firstName: profile?.given_name ?? '',
    lastName: profile?.family_name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone_number ?? '',
    districtId: '',
    street: '',
    building: '',
    flat: '',
    propertyType: propertyTypes[0].value,
    rooms: roomOptions[0].value,
    maxGuests: guestOptions[1].value,
    amenities: [],
    description: '',
    comment: '',
  }))
  const [errors, setErrors] = useState<ApplyErrors>({})

  const set = <K extends keyof ApplyForm>(key: K, value: ApplyForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const text = (key: Exclude<keyof ApplyForm, 'amenities'>) => ({
    value: form[key],
    error: errors[key],
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
  })

  const toggleAmenity = (name: string, checked: boolean) =>
    set('amenities', checked ? [...form.amenities, name] : form.amenities.filter((a) => a !== name))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (create.isPending) return
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
      return
    }
    create.mutate(toRequest(form), {
      onSuccess: (created) =>
        navigate(generatePath(propertyPaths.myRequestDetails, { id: created.id })),
    })
  }

  const districtOptions = districts.map((d) => ({ value: String(d.id), label: d.name }))

  return (
    <Container className={styles.page}>
      <Link to={propertyPaths.owners} className={styles.back}>
        ← Про співпрацю
      </Link>

      <header className={styles.header}>
        <h1>Подати апартаменти на розгляд</h1>
        <p className={styles.muted}>
          Заповніть інформацію про житло. Після розгляду заявки менеджер зв’яжеться з вами.
        </p>
      </header>

      <form ref={formRef} className={styles.form} onSubmit={submit} noValidate>
        <FormSection title="Контактні дані">
          <div className={styles.grid}>
            <Input
              label="Ім’я *"
              placeholder="Андрій"
              autoComplete="given-name"
              maxLength={100}
              {...text('firstName')}
            />
            <Input
              label="Прізвище *"
              placeholder="Коваль"
              autoComplete="family-name"
              maxLength={100}
              {...text('lastName')}
            />
            <Input
              label="Електронна пошта *"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              maxLength={200}
              {...text('email')}
            />
            <Input
              label="Телефон *"
              type="tel"
              placeholder="+380 XX XXX XX XX"
              autoComplete="tel"
              maxLength={50}
              {...text('phone')}
            />
          </div>
        </FormSection>

        <FormSection title="Розташування">
          <p className={styles.muted}>Місто: Київ</p>
          <div className={styles.grid}>
            <Select
              label="Район *"
              placeholder="Оберіть район"
              options={districtOptions}
              {...text('districtId')}
            />
            <Input
              label="Вулиця *"
              placeholder="Введіть вулицю"
              maxLength={200}
              {...text('street')}
            />
            <Input
              label="Будинок *"
              placeholder="Введіть номер"
              maxLength={20}
              className={styles.newRow}
              {...text('building')}
            />
            <Input label="Квартира" placeholder="Введіть номер" maxLength={20} {...text('flat')} />
          </div>
        </FormSection>

        <FormSection title="Про помешкання">
          <div className={styles.grid}>
            <Select label="Тип помешкання *" options={propertyTypes} {...text('propertyType')} />
            <Select label="Кількість кімнат *" options={roomOptions} {...text('rooms')} />
            <Select label="Максимум гостей *" options={guestOptions} {...text('maxGuests')} />
          </div>

          <fieldset className={styles.amenities}>
            <legend className={styles.subtitle}>Зручності</legend>
            <div className={styles.amenityGrid}>
              {amenityOptions.map((a) => (
                <Checkbox
                  key={a}
                  label={a}
                  checked={form.amenities.includes(a)}
                  onChange={(e) => toggleAmenity(a, e.target.checked)}
                />
              ))}
            </div>
          </fieldset>

          <Textarea
            label="Опис *"
            placeholder="Опишіть апартаменти"
            maxLength={3000}
            className={styles.textarea}
            {...text('description')}
          />
        </FormSection>

        <FormSection title="Фотографії">
          <PhotoPicker />
        </FormSection>

        <FormSection title="Додатково">
          <Textarea
            label="Коментар (необов’язково)"
            placeholder="Додаткова інформація для менеджера"
            maxLength={900}
            className={styles.textarea}
            {...text('comment')}
          />
        </FormSection>

        <div className={styles.footer}>
          <InfoMessage title="Перед надсиланням" className={styles.message}>
            Заявка не публікує об’єкт.
          </InfoMessage>
          <p className={styles.muted}>Подання заявки не публікує об’єкт автоматично.</p>
          <Link to={bookingPaths.privacy} className={styles.link}>
            Політика конфіденційності
          </Link>
          {create.isError && (
            <InfoMessage tone="error" title="Не вдалося надіслати" className={styles.message}>
              Дані збережено. Спробуйте ще раз.
            </InfoMessage>
          )}
          <Button
            type="submit"
            className={styles.submit}
            aria-disabled={create.isPending}
            icon={create.isPending ? <span className={styles.spinner} /> : undefined}
          >
            {create.isPending
              ? 'Надсилаємо…'
              : create.isError
                ? 'Повторити надсилання'
                : 'Надіслати заявку'}
          </Button>
        </div>
      </form>
    </Container>
  )
}
