import { NavLink } from 'react-router'
import { useCurrentUser } from '@/shared/auth'
import { primaryRole, sidebarNav } from './navigation'

export function Sidebar() {
  const { roles } = useCurrentUser()
  const section = sidebarNav[primaryRole(roles)]

  return (
    <aside>
      <h3>{section.title}</h3>
      <nav>
        {section.items.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
