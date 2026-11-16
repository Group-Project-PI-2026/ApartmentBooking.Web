import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import {
  Button,
  InfoMessage,
  Loader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import { recentPeriods, useOwnerObjects, useOwnerStatistics } from '../../api/ownerObjects'
import styles from './OwnerStatisticsPage.module.css'

const percent = new Intl.NumberFormat('uk-UA', { style: 'percent', maximumFractionDigits: 0 })

const columns = [
  { key: 'object', title: 'Об’єкт' },
  { key: 'bookings', title: 'Підтверджені бронювання' },
  { key: 'nights', title: 'Заброньовані ночі' },
  { key: 'occupancy', title: 'Завантаженість' },
]

export function OwnerStatisticsPage() {
  const [params, setParams] = useSearchParams()
  const periods = useMemo(() => recentPeriods(), [])
  const objectId = params.get('object') ?? ''
  const period = periods.find((p) => p.value === params.get('period')) ?? periods[0]

  const [draftObject, setDraftObject] = useState(objectId)
  const [draftPeriod, setDraftPeriod] = useState(period.value)

  const { data: objects = [] } = useOwnerObjects()
  const { data: stats, isLoading, isError, isFetching } = useOwnerStatistics(objectId, period)

  const apply = (e: FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams()
    if (draftObject) next.set('object', draftObject)
    if (draftPeriod !== periods[0].value) next.set('period', draftPeriod)
    setParams(next, { replace: true })
  }

  const objectOptions = [
    { value: '', label: 'Усі мої об’єкти' },
    ...objects.map((o) => ({ value: o.id, label: o.title })),
  ]

  const cards = stats && [
    {
      label: 'Підтверджені бронювання',
      value: String(stats.total.bookings),
      hint: 'За вибраний період',
    },
    {
      label: 'Заброньовані ночі',
      value: String(stats.total.nights),
      hint: `Із ${stats.days} календарних ночей`,
    },
    {
      label: 'Завантаженість',
      value: percent.format(stats.total.occupancy),
      hint: `${stats.total.nights} із ${stats.days} календарних ночей`,
    },
  ]

  return (
    <div className={styles.page}>
      <h1>Статистика об’єктів</h1>

      <form className={styles.filters} onSubmit={apply} aria-label="Фільтри статистики">
        <Select
          label="Об’єкт"
          options={objectOptions}
          value={draftObject}
          onChange={(e) => setDraftObject(e.target.value)}
        />
        <Select
          label="Період"
          options={periods.map((p) => ({ value: p.value, label: p.label }))}
          value={draftPeriod}
          onChange={(e) => setDraftPeriod(e.target.value)}
        />
        <Button type="submit" className={styles.apply}>
          Застосувати
        </Button>
      </form>

      <p className={styles.caption}>Демонстраційні дані за вибраний період</p>

      {isLoading && <Loader />}
      {isError && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося завантажити статистику.
        </InfoMessage>
      )}

      {stats && stats.rows.length === 0 && (
        <section className={styles.empty}>
          <h2>За вибраний період даних немає</h2>
          <p className={styles.muted}>Змініть період або виберіть інший із ваших об’єктів.</p>
        </section>
      )}

      {stats && cards && stats.rows.length > 0 && (
        <div className={styles.results} aria-busy={isFetching}>
          <ul className={styles.cards}>
            {cards.map((c) => (
              <li key={c.label} className={styles.stat}>
                <span className={styles.muted}>{c.label}</span>
                <span className={styles.value}>{c.value}</span>
                <span className={styles.caption}>{c.hint}</span>
              </li>
            ))}
          </ul>

          <section className={styles.byObject}>
            <h2>За об’єктами</h2>
            <Table className={styles.table}>
              <TableHeader columns={columns} />
              <TableBody>
                {stats.rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.bookings}</TableCell>
                    <TableCell>{r.nights}</TableCell>
                    <TableCell>{percent.format(r.occupancy)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </div>
      )}
    </div>
  )
}
