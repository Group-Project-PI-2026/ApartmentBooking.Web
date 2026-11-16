import { Link } from 'react-router'
import { paths } from '@/shared/routes/paths'
import { footerNav } from './navigation'

export function Footer() {
  return (
    <footer>
      <Link to={paths.home}>MyRent</Link>
      <nav>
        {footerNav.map((item) => (
          <Link key={item.label} to={item.to}>
            {item.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
