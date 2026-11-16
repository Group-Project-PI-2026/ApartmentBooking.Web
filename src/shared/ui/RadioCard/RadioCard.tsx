import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './RadioCard.module.css'

export interface RadioCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  description?: ReactNode
}

export function RadioCard({ label, description, className, ...rest }: RadioCardProps) {
  return (
    <label className={cn(styles.card, rest.disabled && styles.disabled, className)}>
      <span className={styles.row}>
        <input type="radio" className={styles.input} {...rest} />
        <span className={styles.radio} aria-hidden />
        <span className={styles.label}>{label}</span>
      </span>
      {description && <span className={styles.description}>{description}</span>}
    </label>
  )
}
