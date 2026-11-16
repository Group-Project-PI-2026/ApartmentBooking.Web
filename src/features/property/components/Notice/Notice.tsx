import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Notice.module.css'

interface Props {
  tone: 'success' | 'error'
  children: ReactNode
  className?: string
}

export function Notice({ tone, children, className }: Props) {
  return (
    <div role="status" className={cn(styles.notice, styles[tone], className)}>
      {children}
    </div>
  )
}
