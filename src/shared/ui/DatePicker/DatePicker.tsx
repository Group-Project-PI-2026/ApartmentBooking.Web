import { useEffect, useRef, useState } from 'react'
import chevronRight from '@/shared/assets/icons/chevron-right.svg'
import { cn } from '@/shared/lib/cn'
import {
  addMonths,
  formatLongDate,
  formatMonthTitle,
  fromIso,
  monthGrid,
  startOfMonth,
  todayIso,
  weekdayLabels,
  type IsoDate,
} from '@/shared/lib/date'
import { Field, type FieldProps } from '../Field/Field'
import fieldStyles from '../Field/Field.module.css'
import styles from './DatePicker.module.css'

export interface DatePickerProps extends FieldProps {
  value: IsoDate
  onChange: (value: IsoDate) => void
  min?: IsoDate
  rangeStart?: IsoDate
  rangeEnd?: IsoDate
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  label,
  helper,
  error,
  className,
  value,
  onChange,
  min,
  rangeStart,
  rangeEnd,
  placeholder = 'Оберіть дату',
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => startOfMonth(fromIso(value || min || todayIso())))
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const toggle = () => {
    if (!open) setView(startOfMonth(fromIso(value || min || todayIso())))
    setOpen((o) => !o)
  }

  const select = (iso: IsoDate) => {
    onChange(iso)
    setOpen(false)
  }

  const minMonth = min ? startOfMonth(fromIso(min)) : null
  const canGoBack = !minMonth || view > minMonth
  const today = todayIso()

  return (
    <Field label={label} helper={helper} error={error} className={className}>
      {(control) => (
        <div ref={rootRef} className={styles.root}>
          <button
            type="button"
            className={cn(fieldStyles.control, styles.trigger, !value && styles.placeholder)}
            onClick={toggle}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            {...control}
          >
            {value ? formatLongDate(value) : placeholder}
          </button>

          {open && (
            <div
              className={styles.popover}
              role="dialog"
              aria-label={typeof label === 'string' ? label : undefined}
            >
              <div className={styles.header}>
                <button
                  type="button"
                  className={cn(styles.nav, styles.prev)}
                  onClick={() => setView((v) => addMonths(v, -1))}
                  disabled={!canGoBack}
                  aria-label="Попередній місяць"
                >
                  <img src={chevronRight} alt="" />
                </button>
                <span className={styles.month}>{formatMonthTitle(view)}</span>
                <button
                  type="button"
                  className={styles.nav}
                  onClick={() => setView((v) => addMonths(v, 1))}
                  aria-label="Наступний місяць"
                >
                  <img src={chevronRight} alt="" />
                </button>
              </div>

              <div className={styles.grid}>
                {weekdayLabels.map((d) => (
                  <span key={d} className={styles.weekday}>
                    {d}
                  </span>
                ))}
                {monthGrid(view).map((iso, i) => {
                  if (!iso) return <span key={`empty-${i}`} />
                  const isDisabled = Boolean(min && iso < min)
                  const isSelected = iso === value || iso === rangeStart || iso === rangeEnd
                  const inRange = Boolean(
                    rangeStart && rangeEnd && iso > rangeStart && iso < rangeEnd,
                  )
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={cn(
                        styles.day,
                        inRange && styles.inRange,
                        isSelected && styles.selected,
                        iso === today && styles.today,
                      )}
                      disabled={isDisabled}
                      aria-pressed={iso === value}
                      aria-label={formatLongDate(iso)}
                      onClick={() => select(iso)}
                    >
                      {fromIso(iso).getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Field>
  )
}
