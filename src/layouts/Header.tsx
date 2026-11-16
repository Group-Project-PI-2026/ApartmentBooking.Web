import { Link, NavLink } from 'react-router'
import { useCurrentUser } from '@/shared/auth'
import { paths } from '@/shared/routes/paths'
import { headerNav, headerNavAuthenticated } from './navigation'

export function Header() {
  const { isAuthenticated, login } = useCurrentUser()
  const items = isAuthenticated ? headerNavAuthenticated : headerNav

  return (
    <header>
      <Link to={paths.home}>MyRent</Link>
      <nav>
        {items.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      {!isAuthenticated && (
        <button type="button" onClick={() => void login()}>
          Увійти
        </button>
      )}
    </header>
  )
}
