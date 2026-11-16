import { Button, Checkbox, Input } from '@/shared/ui'
import type { DistrictDto } from '../../api/apartments'
import type { Filters } from './filters'
import styles from './SearchPage.module.css'

interface Props {
  value: Filters
  onChange: (value: Filters) => void
  onReset: () => void
  districts: DistrictDto[]
  amenities: string[]
}

const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

const digits = (raw: string) => raw.replace(/\D/g, '')

export function FiltersPanel({ value, onChange, onReset, districts, amenities }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch })

  return (
    <aside className={styles.filters}>
      <h2>Фільтри</h2>

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>Ціна за ніч, ₴</legend>
        <div className={styles.priceRow}>
          <Input
            label="Від"
            inputMode="numeric"
            value={value.priceFrom}
            onChange={(e) => set({ priceFrom: digits(e.target.value) })}
          />
          <Input
            label="До"
            inputMode="numeric"
            value={value.priceTo}
            onChange={(e) => set({ priceTo: digits(e.target.value) })}
          />
        </div>
      </fieldset>

      {districts.length > 0 && (
        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Райони</legend>
          <div className={styles.checks}>
            {districts.map((d) => (
              <Checkbox
                key={d.id}
                label={d.name}
                checked={value.districtIds.includes(String(d.id))}
                onChange={() => set({ districtIds: toggle(value.districtIds, String(d.id)) })}
              />
            ))}
          </div>
        </fieldset>
      )}

      {amenities.length > 0 && (
        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Зручності</legend>
          <div className={styles.checks}>
            {amenities.map((a) => (
              <Checkbox
                key={a}
                label={a}
                checked={value.amenities.includes(a)}
                onChange={() => set({ amenities: toggle(value.amenities, a) })}
              />
            ))}
          </div>
        </fieldset>
      )}

      <Button variant="secondary" fullWidth onClick={onReset}>
        Скинути фільтри
      </Button>
    </aside>
  )
}
