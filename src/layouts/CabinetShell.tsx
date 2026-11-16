import type { ReactNode } from 'react'
import { Container } from '@/shared/ui'
import { Sidebar } from './Sidebar'
import styles from './Layout.module.css'

export function CabinetShell({ children }: { children: ReactNode }) {
  return (
    <Container className={styles.cabinet}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </Container>
  )
}
