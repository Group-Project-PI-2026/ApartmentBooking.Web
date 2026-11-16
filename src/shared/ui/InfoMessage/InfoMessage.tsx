import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './InfoMessage.module.css'

export type InfoTone = 'info' | 'success' | 'warning' | 'error'

interface Props {
  tone?: InfoTone
  title: ReactNode
  children?: ReactNode
  className?: string
}

export function InfoMessage({ tone = 'info', title, children, className }: Props) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(styles.message, styles[tone], className)}
    >
      <span className={styles.title}>{title}</span>
      {children && <div className={styles.text}>{children}</div>}
    </div>
  )
}
