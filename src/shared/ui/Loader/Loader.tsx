import { cn } from '@/shared/lib/cn'
import styles from './Loader.module.css'

export function Loader({
  label = 'Завантаження…',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <span role="status" className={cn(styles.loader, className)}>
      <span className={styles.dot} aria-hidden />
      {label}
    </span>
  )
}
