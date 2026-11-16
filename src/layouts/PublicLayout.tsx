import { Outlet } from 'react-router'
import { Footer } from './Footer'
import { Header } from './Header'

export function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
