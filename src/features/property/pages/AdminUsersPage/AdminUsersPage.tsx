import { useMemo, useState } from 'react'
import { generatePath } from 'react-router'
import type { Role } from '@/shared/auth'
import {
  Button,
  ButtonLink,
  InfoMessage,
  Input,
  Loader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import { identityLabel, roleLabel, useAdminUsers } from '../../api/adminUsers'
import { propertyPaths } from '../../paths'
import styles from './AdminUsersPage.module.css'

const roleOptions = [
  { value: '', label: 'Усі ролі' },
  ...(Object.keys(roleLabel) as Role[]).map((r) => ({ value: r, label: roleLabel[r] })),
]

const columns = [
  { key: 'name', title: 'Ім’я', width: '16%' },
  { key: 'email', title: 'Email', width: '23%' },
  { key: 'role', title: 'Роль', width: '15%' },
  { key: 'identity', title: 'Перевірка особи', width: '16%' },
  { key: 'objects', title: 'Прив’язані об’єкти', width: '17%' },
  { key: 'action', title: 'Дія' },
]

export function AdminUsersPage() {
  const { data: users, isLoading, isError } = useAdminUsers()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (users ?? []).filter(
      (u) =>
        (!role || u.role === role) &&
        (!term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)),
    )
  }, [users, search, role])

  const reset = () => {
    setSearch('')
    setRole('')
  }

  return (
    <div className={styles.page}>
      <h1>Користувачі</h1>

      <section className={styles.filters} aria-label="Фільтри">
        <Input
          label="Пошук"
          type="search"
          placeholder="Ім’я або email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          label="Роль"
          options={roleOptions}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <Button variant="secondary" onClick={reset}>
          Скинути фільтри
        </Button>
      </section>

      {isLoading && <Loader />}
      {isError && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося завантажити користувачів.
        </InfoMessage>
      )}

      {users && filtered.length === 0 && (
        <section className={styles.empty}>
          <h2>За вибраними параметрами нічого не знайдено</h2>
          <p className={styles.muted}>Змініть пошук або скиньте фільтр ролі.</p>
          <Button variant="secondary" onClick={reset} className={styles.emptyAction}>
            Скинути фільтри
          </Button>
        </section>
      )}

      {filtered.length > 0 && (
        <section className={styles.card}>
          <h2>Список користувачів</h2>
          <Table className={styles.table}>
            <TableHeader columns={columns} />
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{roleLabel[u.role]}</TableCell>
                  <TableCell>{identityLabel[u.identity]}</TableCell>
                  <TableCell>{u.objectsCount}</TableCell>
                  <TableCell>
                    <ButtonLink
                      size="compact"
                      fullWidth
                      to={generatePath(propertyPaths.adminUserDetails, { id: u.id })}
                      aria-label={`Відкрити користувача ${u.name}`}
                    >
                      Відкрити
                    </ButtonLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  )
}
