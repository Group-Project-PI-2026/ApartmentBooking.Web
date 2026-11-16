import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { Role, useCurrentUser } from '@/shared/auth'
import { cn } from '@/shared/lib/cn'
import {
  Button,
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
import {
  identityLabel,
  roleLabel,
  useAdminAction,
  useAdminObjects,
  useAdminUser,
  type AdminObject,
  type AdminUserDetails,
} from '../../api/adminUsers'
import { DetailRows } from '../../components/DetailRows/DetailRows'
import { Notice } from '../../components/Notice/Notice'
import { propertyPaths } from '../../paths'
import { AdminDialog, type Dialog } from './AdminDialog'
import styles from './AdminUserPage.module.css'

const roleOptions = (Object.keys(roleLabel) as Role[]).map((r) => ({
  value: r,
  label: roleLabel[r],
}))

const logColumns = [
  { key: 'at', title: 'Дата й час', width: '15%' },
  { key: 'actor', title: 'Виконавець', width: '16%' },
  { key: 'action', title: 'Дія', width: '22%' },
  { key: 'before', title: 'Було', width: '19%' },
  { key: 'after', title: 'Стало' },
]

const dateTime = new Intl.DateTimeFormat('uk-UA', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function Card({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn(styles.card, className)}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export function AdminUserPage() {
  const { id = '' } = useParams()
  const { data: user, isLoading } = useAdminUser(id)

  if (isLoading) return <Loader />

  if (!user) {
    return (
      <div className={styles.page}>
        <Link to={propertyPaths.adminUsers} className={styles.back}>
          ← До користувачів
        </Link>
        <InfoMessage tone="error" title="Користувача не знайдено">
          Можливо, акаунт видалено або посилання застаріло.
        </InfoMessage>
      </div>
    )
  }

  return <AdminUserView key={user.id} user={user} />
}

function AdminUserView({ user }: { user: AdminUserDetails }) {
  const { profile } = useCurrentUser()
  const actor = profile?.name ?? 'Адміністратор'
  const action = useAdminAction(user.id, actor)
  const { data: catalog = [] } = useAdminObjects()
  const bindingsRef = useRef<HTMLElement>(null)

  const [role, setRole] = useState<Role>(user.role)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<AdminObject | null>(null)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const isOwner = user.role === Role.Owner

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return catalog
      .filter((o) => o.ownerId !== user.id)
      .filter((o) => `${o.title} ${o.address}`.toLowerCase().includes(term))
      .slice(0, 5)
  }, [catalog, query, user.id])

  const open = (next: Dialog) => {
    action.reset()
    setDialog(next)
  }

  const done = (text: string) => {
    setDialog(null)
    setNotice(text)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const changeRole = (next: Role) =>
    action.mutate(
      { type: 'role', role: next },
      {
        onSuccess: () =>
          done(`Роль змінено на «${roleLabel[next]}». Дію додано до адміністративного журналу.`),
      },
    )

  const bind = (object: AdminObject) => {
    const reassigned = object.ownerId !== null
    action.mutate(
      { type: 'bind', objectId: object.id },
      {
        onSuccess: () => {
          setSelected(null)
          setQuery('')
          done(
            reassigned
              ? `${object.title} перепризначено: ${user.name}. Попереднього власника позбавлено доступу до цього об’єкта.`
              : `Об’єкт «${object.title}» прив’язано. Дію додано до адміністративного журналу.`,
          )
        },
      },
    )
  }

  const unbind = (object: AdminObject) =>
    action.mutate(
      { type: 'unbind', objectId: object.id },
      {
        onSuccess: () => done('Прив’язку знято. Тепер зміну ролі можна підтвердити окремою дією.'),
      },
    )

  const showBindings = () => {
    setDialog(null)
    bindingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    bindingsRef.current?.focus()
  }

  return (
    <div className={styles.page}>
      <Link to={propertyPaths.adminUsers} className={styles.back}>
        ← До користувачів
      </Link>

      <header className={styles.header}>
        <h1>{user.name}</h1>
        <p className={styles.muted}>
          {user.email} · {user.phone}
        </p>
      </header>

      {notice && <Notice tone="success">{notice}</Notice>}

      <div className={styles.layout}>
        <div className={styles.column}>
          <Card title="Дані користувача">
            <DetailRows
              rows={[
                ['Перевірка особи', identityLabel[user.identity]],
                ['Поточна роль', roleLabel[user.role]],
              ]}
            />
            <p className={styles.caption}>На акаунті може бути лише одна роль.</p>
          </Card>

          <Card title="Роль">
            <Select
              label="Роль користувача"
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className={styles.narrow}
            />
            <Button
              className={styles.action}
              disabled={role === user.role}
              onClick={() => open({ kind: 'role-confirm', role })}
            >
              Зберегти роль
            </Button>
            <p className={styles.caption}>Зміна ролі потребує підтвердження.</p>
          </Card>

          {user.approvedRequest && (
            <Card title="Схвалена заявка">
              <DetailRows
                rows={[
                  ['Номер', user.approvedRequest.number],
                  ['Стан', user.approvedRequest.status],
                ]}
              />
            </Card>
          )}
        </div>

        <div className={styles.column}>
          <section
            ref={bindingsRef}
            tabIndex={-1}
            className={styles.card}
            aria-labelledby="bindings-title"
          >
            <h2 id="bindings-title">Прив’язані об’єкти</h2>
            {user.objects.length === 0 ? (
              <p>Прив’язаних об’єктів немає</p>
            ) : (
              <ul className={styles.objects}>
                {user.objects.map((o) => (
                  <li key={o.id} className={styles.object}>
                    <span>
                      {o.title} · Київ, {o.district} район
                    </span>
                    <Button
                      variant="destructive"
                      className={styles.action}
                      onClick={() => open({ kind: 'unbind', object: o })}
                    >
                      Зняти прив’язку
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {isOwner && (
            <Card title="Прив’язати об’єкт">
              <Input
                label="Пошук об’єкта"
                type="search"
                placeholder="Назва або адреса"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelected(null)
                }}
                className={styles.narrow}
              />
              {matches.length > 0 && !selected && (
                <ul className={styles.matches} aria-label="Знайдені об’єкти">
                  {matches.map((o) => (
                    <li key={o.id}>
                      <button
                        type="button"
                        className={styles.match}
                        onClick={() => {
                          setSelected(o)
                          setQuery(o.title)
                        }}
                      >
                        <span>{o.title}</span>
                        <span className={styles.caption}>
                          {o.district} район · {o.address}
                          {o.ownerId && ' · має власника'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {query.trim() && matches.length === 0 && !selected && (
                <p className={styles.caption}>Об’єктів за запитом не знайдено.</p>
              )}
              <p className={styles.caption}>Доступні об’єкти обираються з наявного каталогу.</p>
              <Button
                className={styles.action}
                disabled={!selected}
                onClick={() => selected && open({ kind: 'bind-confirm', object: selected })}
              >
                Прив’язати об’єкт
              </Button>
            </Card>
          )}
        </div>
      </div>

      <Card title="Журнал адміністративних дій" className={styles.log}>
        {user.log.length === 0 ? (
          <p className={styles.muted}>Записів ще немає.</p>
        ) : (
          <Table className={styles.table}>
            <TableHeader columns={logColumns} />
            <TableBody>
              {user.log.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{dateTime.format(new Date(entry.at))}</TableCell>
                  <TableCell>{entry.actor}</TableCell>
                  <TableCell>{entry.action}</TableCell>
                  <TableCell>{entry.before}</TableCell>
                  <TableCell>{entry.after}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <p className={styles.caption}>
          Демонстраційні записи. Журнал доступний лише для перегляду.
        </p>
      </Card>

      <AdminDialog
        dialog={dialog}
        user={user}
        pending={action.isPending}
        failed={action.isError}
        onClose={() => setDialog(null)}
        onNext={open}
        onShowBindings={showBindings}
        onRole={changeRole}
        onBind={bind}
        onUnbind={unbind}
      />
    </div>
  )
}
