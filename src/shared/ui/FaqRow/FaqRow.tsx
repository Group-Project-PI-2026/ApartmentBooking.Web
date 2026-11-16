import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './FaqRow.module.css'

interface Props {
  question: string
  answer?: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function FaqRow({ question, answer, defaultOpen = false, className }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const answerId = useId()
  const expanded = Boolean(answer) && open

  return (
    <div className={cn(styles.item, className)}>
      <button
        type="button"
        className={styles.question}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={answer ? expanded : undefined}
        aria-controls={answer ? answerId : undefined}
        disabled={!answer}
      >
        <span>{question}</span>
        <span className={styles.sign} aria-hidden>
          {expanded ? '−' : '+'}
        </span>
      </button>
      {expanded && (
        <div id={answerId} className={styles.answer}>
          {answer}
        </div>
      )}
    </div>
  )
}
