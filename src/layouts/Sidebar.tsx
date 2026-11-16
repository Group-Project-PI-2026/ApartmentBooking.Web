import { NavLink } from 'react-router'
import { useCurrentUser } from '@/shared/auth'
import { cn } from '@/shared/lib/cn'
import { primaryRole, sidebarNav } from './navigation'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { roles } = useCurrentUser()
  const section = sidebarNav[primaryRole(roles)]

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>{section.title}</h3>
      <nav className={styles.nav}>
        {section.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) => cn(styles.item, isActive && styles.active)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
