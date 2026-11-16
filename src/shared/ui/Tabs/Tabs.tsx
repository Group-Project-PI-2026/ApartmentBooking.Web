import { cn } from '@/shared/lib/cn'
import styles from './Tabs.module.css'

export interface TabItem<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  label?: string
  className?: string
}

export function Tabs<T extends string>({ items, value, onChange, label, className }: Props<T>) {
  return (
    <div role="tablist" aria-label={label} className={cn(styles.tabs, className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={cn(styles.tab, active && styles.active)}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
