import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Checkbox.module.css'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  invalid?: boolean
}

export function Checkbox({ label, invalid, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn(styles.checkbox, rest.disabled && styles.disabled, className)}>
      <input type="checkbox" className={styles.input} aria-invalid={invalid} {...rest} />
      <span className={styles.box} aria-hidden />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
