import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  Button,
  ButtonLink,
  Checkbox,
  InfoMessage,
  Input,
  Loader,
  Select,
  Textarea,
} from '@/shared/ui'
import {
  kyivDistricts,
  useManagerApartment,
  useSaveApartment,
  type ManagerApartment,
  type PublicationState,
} from '../../api/managerApartments'
import { amenityOptions, guestOptions, propertyTypes, roomOptions } from '../../apartmentOptions'
import { publicationLabel } from '../../apartmentState'
import { PhotoPicker } from '../../components/PhotoPicker/PhotoPicker'
import { propertyPaths } from '../../paths'
import type { CatalogFlash } from '../ManagerApartmentsPage/ManagerApartmentsPage'
import {
  emptyForm,
  fromApartment,
  toInput,
  validate,
  type ApartmentForm,
  type FormErrors,
  type TextField,
} from './apartmentForm'
import styles from './ApartmentFormPage.module.css'

const districtOptions = kyivDistricts.map((d) => ({ value: d, label: d }))

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export function ApartmentFormPage() {
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useManagerApartment(id)

  if (id && isLoading) return <Loader />
  if (id && (isError || !data)) {
    return (
      <div className={styles.page}>
        <Link to={propertyPaths.managerApartments} className={styles.back}>
          ← До каталогу
        </Link>
        <InfoMessage tone="error" title="Апартаменти не знайдено">
          Можливо, об’єкт видалено або посилання застаріло.
        </InfoMessage>
      </div>
    )
  }

  return <ApartmentFormView key={id || 'new'} apartment={data} />
}

function ApartmentFormView({ apartment }: { apartment?: ManagerApartment }) {
  const navigate = useNavigate()
  const save = useSaveApartment(apartment?.id)
  const formRef = useRef<HTMLFormElement>(null)
  const [form, setForm] = useState<ApartmentForm>(() =>
    apartment ? fromApartment(apartment) : emptyForm,
  )
  const [errors, setErrors] = useState<FormErrors>({})

  const set = <K extends keyof ApartmentForm>(key: K, value: ApartmentForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const field = (key: TextField) => ({
    value: form[key],
    error: errors[key],
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
  })

  const stateOptions = (Object.keys(publicationLabel) as PublicationState[])
    .filter((s) => s !== 'Archived' || apartment?.state === 'Archived')
    .map((s) => ({ value: s, label: publicationLabel[s] }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (save.isPending) return
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
      return
    }
    save.mutate(toInput(form), {
      onSuccess: () => {
        const state: CatalogFlash = { saved: true }
        navigate(propertyPaths.managerApartments, { state })
      },
      onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    })
  }

  return (
    <div className={styles.page}>
      <Link to={propertyPaths.managerApartments} className={styles.back}>
        ← До каталогу
      </Link>

      <header className={styles.header}>
        <h1>{apartment ? 'Редагувати апартаменти' : 'Додати апартаменти'}</h1>
        <span className={styles.caption}>{publicationLabel[apartment?.state ?? 'Draft']}</span>
      </header>

      {save.isError && (
        <InfoMessage tone="error" title="Не вдалося зберегти апартаменти" className={styles.error}>
          Введені дані збережено в цій формі. Спробуйте ще раз.
        </InfoMessage>
      )}

      <form ref={formRef} className={styles.form} onSubmit={submit} noValidate>
        <Section title="Основна інформація">
          <Input
            label="Назва *"
            placeholder="Введіть назву"
            maxLength={200}
            className={styles.narrow}
            {...field('title')}
          />
          <Textarea
            label="Опис *"
            placeholder="Опишіть апартаменти"
            rows={2}
            maxLength={4000}
            {...field('description')}
          />
          <div className={styles.grid}>
            <Select label="Тип помешкання *" options={propertyTypes} {...field('propertyType')} />
            <Select label="Кількість кімнат *" options={roomOptions} {...field('rooms')} />
            <Select label="Максимум гостей *" options={guestOptions} {...field('maxGuests')} />
          </div>
        </Section>

        <Section title="Розташування">
          <p className={styles.muted}>Місто: Київ</p>
          <div className={styles.grid}>
            <Select
              label="Район *"
              placeholder="Оберіть район"
              options={districtOptions}
              {...field('district')}
            />
            <Input
              label="Вулиця *"
              placeholder="Введіть вулицю"
              maxLength={200}
              {...field('street')}
            />
            <Input
              label="Будинок *"
              placeholder="Введіть номер"
              maxLength={20}
              className={styles.newRow}
              {...field('building')}
            />
            <Input label="Квартира" placeholder="Введіть номер" maxLength={20} {...field('flat')} />
          </div>
        </Section>

        <Section title="Власник">
          <Select
            label="Наявна прив’язка власника"
            options={[{ value: '', label: apartment?.ownerName ?? 'Не призначено' }]}
            value=""
            disabled
            className={styles.narrow}
          />
          <p className={styles.caption}>Зміни прив’язки власника виконує адміністратор.</p>
        </Section>

        <Section title="Зручності">
          <div className={styles.amenities}>
            {amenityOptions.map((a) => (
              <Checkbox
                key={a}
                label={a}
                checked={form.amenities.includes(a)}
                onChange={(e) =>
                  set(
                    'amenities',
                    e.target.checked
                      ? [...form.amenities, a]
                      : form.amenities.filter((x) => x !== a),
                  )
                }
              />
            ))}
          </div>
        </Section>

        <Section title="Фотографії">
          <PhotoPicker value={form.photos} onChange={(p) => set('photos', p)} ordering />
        </Section>

        <Section title="Ціна">
          <Input
            label="Базова ціна за ніч *"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="1800"
            helper="Ціна в гривнях за одну ніч."
            className={styles.narrow}
            {...field('pricePerNight')}
          />
        </Section>

        <Section title="Правила проживання">
          <div className={styles.grid}>
            <Input label="Заїзд" placeholder="Після 15:00" maxLength={50} {...field('checkIn')} />
            <Input label="Виїзд" placeholder="До 11:00" maxLength={50} {...field('checkOut')} />
          </div>
          <Textarea
            label="Правила"
            placeholder="Наприклад, без куріння у помешканні."
            rows={2}
            maxLength={2000}
            {...field('rules')}
          />
        </Section>

        <Section title="Інструкції заселення">
          <Textarea
            label="Службова інструкція"
            placeholder="Як гостю потрапити в помешкання"
            helper="Гість побачить інструкції вранці в день заселення. Тоді ж їх буде надіслано на email."
            rows={2}
            maxLength={4000}
            {...field('checkInInstructions')}
          />
        </Section>

        <Section title="Публікація">
          <Select
            label="Стан публікації"
            options={stateOptions}
            value={form.state}
            onChange={(e) => set('state', e.target.value as PublicationState)}
            helper="Архівування наявного об’єкта потребує окремого підтвердження."
            className={styles.narrow}
          />
        </Section>

        <div className={styles.buttons}>
          <Button type="submit" aria-disabled={save.isPending}>
            {save.isPending ? 'Зберігаємо…' : save.isError ? 'Спробувати ще раз' : 'Зберегти'}
          </Button>
          <ButtonLink to={propertyPaths.managerApartments} variant="secondary">
            Скасувати
          </ButtonLink>
        </div>
      </form>
    </div>
  )
}
