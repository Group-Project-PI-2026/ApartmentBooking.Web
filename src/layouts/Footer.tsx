import { Link } from 'react-router'
import { paths } from '@/shared/routes/paths'
import { Container, Logo } from '@/shared/ui'
import { footerNav } from './navigation'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.inner}>
          <Link to={paths.home} className={styles.logo}>
            <Logo />
          </Link>
          <nav className={styles.nav}>
            {footerNav.map((item) => (
              <Link key={item.label} to={item.to} className={styles.link}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  )
}
