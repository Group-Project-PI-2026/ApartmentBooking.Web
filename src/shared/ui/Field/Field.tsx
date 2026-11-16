import { useId, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Field.module.css'

export interface FieldProps {
  label?: ReactNode
  helper?: ReactNode
  error?: ReactNode
  className?: string
}

interface Props extends FieldProps {
  children: (control: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }) => ReactNode
}

export function Field({ label, helper, error, className, children }: Props) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error || helper

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': message ? messageId : undefined,
      })}
      {message && (
        <span id={messageId} className={error ? styles.error : styles.helper}>
          {message}
        </span>
      )}
    </div>
  )
}
