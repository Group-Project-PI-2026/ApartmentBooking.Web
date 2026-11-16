import { cn } from '@/shared/lib/cn'
import styles from './PhotoPlaceholder.module.css'

export function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn(styles.placeholder, className)} aria-hidden>
      <span className={styles.icon} />
    </div>
  )
}
