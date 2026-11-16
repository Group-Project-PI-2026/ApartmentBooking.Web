import { Outlet } from 'react-router'
import { RequireAuth } from '@/shared/auth'
import { Footer } from './Footer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function CabinetLayout() {
  return (
    <RequireAuth>
      <Header />
      <div>
        <Sidebar />
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
    </RequireAuth>
  )
}
