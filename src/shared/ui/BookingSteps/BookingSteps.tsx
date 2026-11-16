import { cn } from '@/shared/lib/cn'
import styles from './BookingSteps.module.css'

interface Props {
  steps: string[]
  current: number
  className?: string
}

export function BookingSteps({ steps, current, className }: Props) {
  return (
    <ol className={cn(styles.steps, className)}>
      {steps.map((label, index) => {
        const number = index + 1
        const active = number === current
        return (
          <li
            key={label}
            className={cn(styles.step, active && styles.active)}
            aria-current={active ? 'step' : undefined}
          >
            <span className={styles.number}>{number}</span>
            <span className={styles.label}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
