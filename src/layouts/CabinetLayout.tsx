import { Outlet } from 'react-router'
import { RequireAuth } from '@/shared/auth'
import { Container } from '@/shared/ui'
import { Footer } from './Footer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import styles from './Layout.module.css'

export function CabinetLayout() {
  return (
    <RequireAuth>
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <Container className={styles.cabinet}>
            <Sidebar />
            <div className={styles.content}>
              <Outlet />
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
