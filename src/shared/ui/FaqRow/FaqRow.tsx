import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './FaqRow.module.css'

interface Props {
  question: string
  answer?: ReactNode
  className?: string
}

export function FaqRow({ question, answer, className }: Props) {
  const [open, setOpen] = useState(false)
  const answerId = useId()

  return (
    <div className={cn(styles.row, className)}>
      <button
        type="button"
        className={styles.question}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={answer ? open : undefined}
        aria-controls={answer ? answerId : undefined}
        disabled={!answer}
      >
        <span>{question}</span>
        <span className={cn(styles.plus, open && styles.open)} aria-hidden>
          +
        </span>
      </button>
      {answer && open && (
        <div id={answerId} className={styles.answer}>
          {answer}
        </div>
      )}
    </div>
  )
}
