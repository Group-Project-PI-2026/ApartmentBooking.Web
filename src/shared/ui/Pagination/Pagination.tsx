import chevronRight from '@/shared/assets/icons/chevron-right.svg'
import { cn } from '@/shared/lib/cn'
import styles from './Pagination.module.css'

interface Props {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onChange, className }: Props) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Сторінки" className={cn(styles.pagination, className)}>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={cn(styles.item, p === page && styles.active)}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      {page < totalPages && (
        <button
          type="button"
          className={cn(styles.item, styles.next)}
          onClick={() => onChange(page + 1)}
        >
          Наступна
          <img src={chevronRight} alt="" />
        </button>
      )}
    </nav>
  )
}
