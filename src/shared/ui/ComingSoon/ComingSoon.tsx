import { cn } from '@/shared/lib/cn'
import styles from './ComingSoon.module.css'

export function ComingSoon({ className }: { className?: string }) {
  return (
    <span className={cn(styles.badge, className)} title="Функція з’явиться після оновлення бекенду">
      Незабаром
    </span>
  )
}
