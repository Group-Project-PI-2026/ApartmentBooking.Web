import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Status.module.css'

export type StatusTone = 'success' | 'warning' | 'error' | 'pending'

interface Props {
  tone: StatusTone
  children: ReactNode
  className?: string
}

export function Status({ tone, children, className }: Props) {
  return <span className={cn(styles.status, styles[tone], className)}>{children}</span>
}
