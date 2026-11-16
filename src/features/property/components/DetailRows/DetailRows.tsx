import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './DetailRows.module.css'

interface Props {
  rows: [string, ReactNode][]
  className?: string
}

export function DetailRows({ rows, className }: Props) {
  return (
    <dl className={cn(styles.rows, className)}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.row}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
