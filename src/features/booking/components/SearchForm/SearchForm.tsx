import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { addDays, todayIso } from '@/shared/lib/date'
import { Button, DatePicker, Input, Select } from '@/shared/ui'
import { useDistricts } from '../../api/apartments'
import { emptySearch, searchUrl, type SearchQuery } from '../../searchQuery'
import styles from './SearchForm.module.css'

const MAX_GUESTS = 50

interface Props {
  initial?: SearchQuery
  submitLabel?: string
  allDistrictsLabel?: string
}

export function SearchForm({
  initial = emptySearch,
  submitLabel = 'Знайти апартаменти',
  allDistrictsLabel,
}: Props) {
  const navigate = useNavigate()
  const { data: districts = [] } = useDistricts()
  const [query, setQuery] = useState(initial)
  const [checkOutError, setCheckOutError] = useState('')

  const today = todayIso()
  const set = (patch: Partial<SearchQuery>) => setQuery((q) => ({ ...q, ...patch }))

  const districtOptions = districts.map((d) => ({ value: String(d.id), label: d.name }))
  const options = allDistrictsLabel
    ? [{ value: '', label: allDistrictsLabel }, ...districtOptions]
    : districtOptions

  const changeCheckIn = (checkIn: string) => {
    set({ checkIn, checkOut: query.checkOut && query.checkOut <= checkIn ? '' : query.checkOut })
    setCheckOutError('')
  }

  const changeGuests = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return set({ guests: '' })
    set({ guests: String(Math.min(Math.max(Number(digits), 1), MAX_GUESTS)) })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (query.checkIn && !query.checkOut) {
      setCheckOutError('Оберіть дату виїзду')
      return
    }
    navigate(searchUrl(query))
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <Select
        label="Район Києва"
        placeholder={allDistrictsLabel ? undefined : 'Оберіть район'}
        helper="Лише Київ"
        options={options}
        value={query.districtId}
        onChange={(e) => set({ districtId: e.target.value })}
      />
      <DatePicker
        label="Заїзд"
        value={query.checkIn}
        onChange={changeCheckIn}
        min={today}
        rangeStart={query.checkIn}
        rangeEnd={query.checkOut}
      />
      <DatePicker
        label="Виїзд"
        value={query.checkOut}
        onChange={(checkOut) => {
          set({ checkOut })
          setCheckOutError('')
        }}
        min={addDays(query.checkIn || today, 1)}
        rangeStart={query.checkIn}
        rangeEnd={query.checkOut}
        error={checkOutError}
      />
      <Input
        label="Гості"
        inputMode="numeric"
        placeholder="Кількість гостей"
        value={query.guests}
        onChange={(e) => changeGuests(e.target.value)}
      />
      <Button type="submit" className={styles.submit}>
        {submitLabel}
      </Button>
    </form>
  )
}
