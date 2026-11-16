import { useEffect, useState } from 'react'
import { generatePath, useLocation, useSearchParams } from 'react-router'
import {
  Button,
  ButtonLink,
  InfoMessage,
  Input,
  Loader,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import { useManagerRequests } from '../../api/managerRequests'
import { requestNumber, requestStatus, type OwnerRequestStatus } from '../../api/ownerRequests'
import { Notice } from '../../components/Notice/Notice'
import { formatShortDate } from '../../format'
import { propertyPaths } from '../../paths'
import { requestStatusLabel } from '../../requestStatus'
import styles from './ManagerRequestsPage.module.css'

const PAGE_SIZE = 20

const statusOptions = [
  { value: '', label: 'Усі статуси' },
  ...(Object.keys(requestStatusLabel) as OwnerRequestStatus[]).map((s) => ({
    value: s,
    label: requestStatusLabel[s],
  })),
]

const columns = [
  { key: 'number', title: 'Номер', width: '140px' },
  { key: 'date', title: 'Дата подання', width: '160px' },
  { key: 'owner', title: 'Заявник', width: '200px' },
  { key: 'address', title: 'Адреса об’єкта' },
  { key: 'status', title: 'Статус', width: '230px' },
  { key: 'action', title: 'Дія', width: '160px' },
]

export interface RequestsFlash {
  approved: string
}

export function ManagerRequestsPage() {
  const [params, setParams] = useSearchParams()
  const flash = (useLocation().state as RequestsFlash | null)?.approved
  const search = params.get('q') ?? ''
  const status = (params.get('status') ?? '') as OwnerRequestStatus | ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const [searchInput, setSearchInput] = useState(search)

  const update = (changes: Record<string, string>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(changes)) {
          if (v) next.set(k, v)
          else next.delete(k)
        }
        return next
      },
      { replace: true },
    )

  useEffect(() => {
    if (searchInput === search) return
    const timer = setTimeout(() => update({ q: searchInput.trim(), page: '' }), 300)
    return () => clearTimeout(timer)
  })

  const { data, isLoading, isError, isFetching } = useManagerRequests({
    search,
    status,
    page,
    pageSize: PAGE_SIZE,
  })

  const items = data?.items ?? []
  const totalPages = data ? Math.ceil(Number(data.totalCount) / PAGE_SIZE) : 0
  const filtered = Boolean(search || status)

  const reset = () => {
    setSearchInput('')
    setParams({}, { replace: true })
  }

  return (
    <div className={styles.page}>
      <h1>Заявки на співпрацю</h1>

      {flash && (
        <Notice tone="success">
          Заявку {flash} схвалено. Доступ власника налаштовує адміністратор.
        </Notice>
      )}

      <section className={styles.filters} aria-label="Фільтри">
        <Input
          label="Пошук"
          type="search"
          placeholder="Номер, заявник або адреса"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          label="Статус"
          options={statusOptions}
          value={status}
          onChange={(e) => update({ status: e.target.value, page: '' })}
        />
        <Button variant="secondary" onClick={reset} disabled={!filtered && !searchInput}>
          Скинути фільтри
        </Button>
      </section>

      {isLoading && <Loader />}

      {isError && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося завантажити заявки.
        </InfoMessage>
      )}

      {data && items.length === 0 && (
        <section className={styles.empty}>
          <h3>{filtered ? 'Нічого не знайдено' : 'Заявок ще немає'}</h3>
          <p className={styles.muted}>
            {filtered
              ? 'Змініть пошук або скиньте фільтри.'
              : 'Нові заявки на співпрацю з’являться тут після подання.'}
          </p>
        </section>
      )}

      {items.length > 0 && (
        <section className={styles.card} aria-busy={isFetching}>
          <h2>Список заявок</h2>
          <Table className={styles.table}>
            <TableHeader columns={columns} />
            <TableBody>
              {items.map((r) => {
                const s = requestStatus(r.status)
                const number = requestNumber(r.number)
                return (
                  <TableRow key={r.id}>
                    <TableCell>{number}</TableCell>
                    <TableCell>{formatShortDate(r.createdAt)}</TableCell>
                    <TableCell>{r.contactName}</TableCell>
                    <TableCell>
                      Київ, {r.districtName} район · {r.address}
                    </TableCell>
                    <TableCell className={styles[s]}>{requestStatusLabel[s]}</TableCell>
                    <TableCell>
                      <ButtonLink
                        size="compact"
                        fullWidth
                        to={generatePath(propertyPaths.managerRequestDetails, { id: r.id })}
                        aria-label={`Розглянути заявку ${number}`}
                      >
                        Розглянути
                      </ButtonLink>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => update({ page: p > 1 ? String(p) : '' })}
          />
        </section>
      )}
    </div>
  )
}
