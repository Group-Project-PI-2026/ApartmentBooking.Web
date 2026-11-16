import type { HTMLAttributes, ReactNode, TdHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Table.module.css'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn(styles.wrapper, className)}>
      <table className={styles.table}>{children}</table>
    </div>
  )
}

export interface TableColumn {
  key: string
  title: ReactNode
  width?: string
}

export function TableHeader({ columns }: { columns: TableColumn[] }) {
  return (
    <>
      <colgroup>
        {columns.map((c) => (
          <col key={c.key} style={c.width ? { width: c.width } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} scope="col" className={styles.headCell}>
              {c.title}
            </th>
          ))}
        </tr>
      </thead>
    </>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableRow({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn(styles.row, className)} {...rest} />
}

export function TableCell({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn(styles.cell, className)} {...rest} />
}
