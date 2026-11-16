import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { bookingPaths } from '@/features/booking/paths'
import closeIcon from '@/shared/assets/icons/close.svg'
import menuIcon from '@/shared/assets/icons/menu.svg'
import { useCurrentUser } from '@/shared/auth'
import { cn } from '@/shared/lib/cn'
import { paths } from '@/shared/routes/paths'
import { Button, Container, Logo } from '@/shared/ui'
import { headerNav } from './navigation'
import styles from './Header.module.css'

export function Header() {
  const { isAuthenticated, login } = useCurrentUser()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)

  const accountLinks = isAuthenticated ? (
    <>
      <NavLink to={bookingPaths.myBookings} className={styles.link} onClick={close}>
        Мої бронювання
      </NavLink>
      <NavLink to={bookingPaths.profile} className={styles.link} onClick={close}>
        Профіль
      </NavLink>
    </>
  ) : (
    <Button
      className={styles.login}
      onClick={() => {
        close()
        void login()
      }}
    >
      Увійти
    </Button>
  )

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.bar}>
          <Link to={paths.home} className={styles.logo} onClick={close}>
            <Logo />
          </Link>
          <nav className={styles.nav} aria-label="Головне меню">
            {headerNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={styles.link}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.account}>{accountLinks}</div>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Закрити меню' : 'Відкрити меню'}
            onClick={() => setOpen((o) => !o)}
          >
            <img src={open ? closeIcon : menuIcon} alt="" width={24} height={24} />
          </button>
        </div>
        <nav
          id="mobile-menu"
          className={cn(styles.mobileMenu, open && styles.mobileMenuOpen)}
          aria-label="Меню"
          hidden={!open}
        >
          {headerNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={styles.link} onClick={close}>
              {item.label}
            </NavLink>
          ))}
          {accountLinks}
        </nav>
      </Container>
    </header>
  )
}
