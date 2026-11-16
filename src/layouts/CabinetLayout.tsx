import { Outlet } from 'react-router'
import { RequireAuth } from '@/shared/auth'
import { CabinetShell } from './CabinetShell'
import { Footer } from './Footer'
import { Header } from './Header'
import styles from './Layout.module.css'

export function CabinetLayout() {
  return (
    <RequireAuth>
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <CabinetShell>
            <Outlet />
          </CabinetShell>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  )
}
