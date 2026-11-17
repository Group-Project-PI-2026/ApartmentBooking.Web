import { useMemo, useState } from 'react'
import { generatePath, Link, useLocation } from 'react-router'
import { formatGuests, formatPrice } from '@/shared/lib/format'
import {
  Button,
  ButtonLink,
  InfoMessage,
  Input,
  Loader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import {
  apartmentAddress,
  kyivDistricts,
  useArchiveApartment,
  useManagerApartments,
  type ManagerApartment,
  type PublicationState,
} from '../../api/managerApartments'
import { publicationLabel } from '../../apartmentState'
import { Notice } from '../../components/Notice/Notice'
import { propertyPaths } from '../../paths'
import { ApartmentInfoModal } from './ApartmentInfoModal'
import { ArchiveModal } from './ArchiveModal'
import styles from './ManagerApartmentsPage.module.css'

export interface CatalogFlash {
  saved: true
}

const districtOptions = [
  { value: '', label: 'Усі райони' },
  ...kyivDistricts.map((d) => ({ value: d, label: d })),
]

const stateOptions = [
  { value: '', label: 'Усі стани' },
  ...(Object.keys(publicationLabel) as PublicationState[]).map((s) => ({
    value: s,
    label: publicationLabel[s],
  })),
]

const columns = [
  { key: 'title', title: 'Фото й назва', width: '22%' },
  { key: 'district', title: 'Район / адреса', width: '15%' },
  { key: 'owner', title: 'Власник', width: '12%' },
  { key: 'guests', title: 'Місткість', width: '8%' },
  { key: 'price', title: 'Ціна за ніч', width: '10%' },
  { key: 'state', title: 'Стан', width: '12%' },
  { key: 'actions', title: 'Дії' },
]

export function ManagerApartmentsPage() {
  const savedFlash = Boolean((useLocation().state as CatalogFlash | null)?.saved)
  const { data: apartments, isLoading, isError } = useManagerApartments()
  const archive = useArchiveApartment()
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('')
  const [state, setState] = useState('')
  const [viewing, setViewing] = useState<ManagerApartment | null>(null)
  const [archiving, setArchiving] = useState<ManagerApartment | null>(null)
  const [archived, setArchived] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (apartments ?? []).filter(
      (a) =>
        (!district || a.district === district) &&
        (!state || a.state === state) &&
        (!term ||
          a.title.toLowerCase().includes(term) ||
          apartmentAddress(a).toLowerCase().includes(term)),
    )
  }, [apartments, search, district, state])

  const reset = () => {
    setSearch('')
    setDistrict('')
    setState('')
  }

  const confirmArchive = () => {
    if (!archiving) return
    archive.mutate(archiving.id, {
      onSuccess: () => {
        setArchiving(null)
        setArchived(true)
      },
    })
  }

  const isEmpty = apartments?.length === 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Апартаменти</h1>
        <ButtonLink to={propertyPaths.managerApartmentNew} className={styles.add}>
          Додати апартаменти
        </ButtonLink>
      </header>

      <InfoMessage tone="warning" title="Демонстраційні дані">
        Керування апартаментами ще не підключене до бекенду: список не збігається з публічним
        каталогом, а зміни зберігаються лише до перезавантаження сторінки.
      </InfoMessage>

      {archived && (
        <Notice tone="success">
          Апартаменти архівовано. Об’єкт приховано з пошуку; бронювання та історію збережено.
        </Notice>
      )}
      {savedFlash && !archived && <Notice tone="success">Зміни апартаментів збережено.</Notice>}

      {isLoading && <Loader />}
      {isError && <Notice tone="error">Не вдалося завантажити каталог. Спробуйте ще раз.</Notice>}

      {isEmpty && (
        <section className={styles.empty}>
          <h2>Апартаменти ще не додані</h2>
          <p className={styles.muted}>Створіть перший об’єкт, щоб додати його до каталогу.</p>
          <ButtonLink to={propertyPaths.managerApartmentNew} className={styles.emptyAction}>
            Додати апартаменти
          </ButtonLink>
        </section>
      )}

      {apartments && !isEmpty && (
        <>
          <section className={styles.filters} aria-label="Фільтри">
            <Input
              label="Пошук"
              type="search"
              placeholder="Назва або адреса"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Район"
              options={districtOptions}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
            <Select
              label="Стан публікації"
              options={stateOptions}
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <Button variant="text" onClick={reset}>
              Скинути фільтри
            </Button>
          </section>

          {filtered.length === 0 ? (
            <section className={styles.empty}>
              <h2>За вибраними параметрами нічого не знайдено</h2>
              <p className={styles.muted}>Спробуйте змінити запит або фільтри.</p>
              <Button variant="secondary" onClick={reset} className={styles.emptyAction}>
                Скинути фільтри
              </Button>
            </section>
          ) : (
            <Table className={styles.table}>
              <TableHeader columns={columns} />
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className={styles.titleCell}>
                        {a.photos[0] && (
                          <img src={a.photos[0].url} alt="" className={styles.thumb} />
                        )}
                        <span className={styles.title}>{a.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{a.district} район</div>
                      <div className={styles.muted}>{apartmentAddress(a)}</div>
                    </TableCell>
                    <TableCell>{a.ownerName ?? 'Не призначено'}</TableCell>
                    <TableCell>{formatGuests(a.maxGuests)}</TableCell>
                    <TableCell>{formatPrice(a.pricePerNight)} / ніч</TableCell>
                    <TableCell className={styles[a.state]}>{publicationLabel[a.state]}</TableCell>
                    <TableCell>
                      <div className={styles.actions}>
                        <button type="button" className={styles.link} onClick={() => setViewing(a)}>
                          Переглянути
                        </button>
                        <Link
                          to={generatePath(propertyPaths.managerApartmentEdit, { id: a.id })}
                          className={styles.link}
                        >
                          Редагувати
                        </Link>
                        {a.state !== 'Archived' && (
                          <button
                            type="button"
                            className={`${styles.link} ${styles.danger}`}
                            onClick={() => {
                              archive.reset()
                              setArchiving(a)
                            }}
                          >
                            Архівувати
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      <ApartmentInfoModal apartment={viewing} onClose={() => setViewing(null)} />
      <ArchiveModal
        apartment={archiving}
        pending={archive.isPending}
        failed={archive.isError}
        onClose={() => setArchiving(null)}
        onConfirm={confirmArchive}
      />
    </div>
  )
}
