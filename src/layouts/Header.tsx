import { Link, NavLink } from 'react-router'
import { bookingPaths } from '@/features/booking/paths'
import { useCurrentUser } from '@/shared/auth'
import { paths } from '@/shared/routes/paths'
import { Button, Container, Logo } from '@/shared/ui'
import { headerNav } from './navigation'
import styles from './Header.module.css'

export function Header() {
  const { isAuthenticated, login } = useCurrentUser()

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.bar}>
          <Link to={paths.home} className={styles.logo}>
            <Logo />
          </Link>
          <nav className={styles.nav}>
            {headerNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={styles.link}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          {isAuthenticated ? (
            <>
              <NavLink to={bookingPaths.myBookings} className={styles.link}>
                Мої бронювання
              </NavLink>
              <NavLink to={bookingPaths.profile} className={styles.link}>
                Профіль
              </NavLink>
            </>
          ) : (
            <Button className={styles.login} onClick={() => void login()}>
              Увійти
            </Button>
          )}
        </div>
      </Container>
    </header>
  )
}
