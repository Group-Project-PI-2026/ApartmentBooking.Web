import { Role } from '@/shared/auth'
import { Button, InfoMessage, Modal } from '@/shared/ui'
import { ownerName, roleLabel, type AdminObject, type AdminUserDetails } from '../../api/adminUsers'
import { DetailRows } from '../../components/DetailRows/DetailRows'
import styles from './AdminUserPage.module.css'

export type Dialog =
  | { kind: 'role-confirm'; role: Role }
  | { kind: 'role-dependencies' }
  | { kind: 'role-final'; role: Role }
  | { kind: 'bind-confirm'; object: AdminObject }
  | { kind: 'bind-reassign'; object: AdminObject }
  | { kind: 'unbind'; object: AdminObject }

interface Props {
  dialog: Dialog | null
  user: AdminUserDetails
  pending: boolean
  failed: boolean
  onClose: () => void
  onNext: (dialog: Dialog) => void
  onShowBindings: () => void
  onRole: (role: Role) => void
  onBind: (object: AdminObject) => void
  onUnbind: (object: AdminObject) => void
}

export function AdminDialog({
  dialog,
  user,
  pending,
  failed,
  onClose,
  onNext,
  onShowBindings,
  onRole,
  onBind,
  onUnbind,
}: Props) {
  const cancel = (
    <Button variant="secondary" onClick={onClose}>
      Скасувати
    </Button>
  )
  const error = failed && (
    <InfoMessage tone="error" title="Спробуйте ще раз">
      Не вдалося зберегти зміни.
    </InfoMessage>
  )

  if (!dialog) return <Modal open={false} onClose={onClose} title="" />

  switch (dialog.kind) {
    case 'role-confirm': {
      const leavingOwner = user.role === Role.Owner && dialog.role !== Role.Owner
      const next: Dialog =
        leavingOwner && user.objects.length > 0
          ? { kind: 'role-dependencies' }
          : { kind: 'role-final', role: dialog.role }
      return (
        <Modal
          open
          onClose={onClose}
          title="Змінити роль користувача?"
          description="Для акаунта буде встановлено одну нову роль."
          actions={
            <>
              <Button onClick={() => onNext(next)}>Перевірити залежності</Button>
              {cancel}
            </>
          }
        >
          <DetailRows
            className={styles.dialogRows}
            rows={[
              ['Користувач', user.name],
              ['Поточна роль', roleLabel[user.role]],
              ['Нова роль', roleLabel[dialog.role]],
            ]}
          />
        </Modal>
      )
    }

    case 'role-dependencies':
      return (
        <Modal
          open
          onClose={onClose}
          title="Є пов’язані об’єкти"
          description="Зміна ролі впливає на доступ до прив’язаних об’єктів. Спочатку явно зніміть прив’язку; автоматичних змін немає."
          actions={
            <>
              <Button onClick={onShowBindings}>До прив’язок</Button>
              {cancel}
            </>
          }
        >
          <DetailRows
            className={styles.dialogRows}
            rows={[
              ['Поточна роль', roleLabel[user.role]],
              ['Прив’язані об’єкти', user.objects.length],
            ]}
          />
        </Modal>
      )

    case 'role-final': {
      const label = roleLabel[dialog.role]
      const prefix = user.role === Role.Owner ? 'Прив’язаних об’єктів більше немає. ' : ''
      return (
        <Modal
          open
          onClose={onClose}
          title={`Змінити роль на «${label}»?`}
          description={`${prefix}Після підтвердження акаунт матиме одну роль: «${label}».`}
          actions={
            <>
              <Button onClick={() => onRole(dialog.role)} disabled={pending}>
                Зберегти роль
              </Button>
              {cancel}
            </>
          }
        >
          {error}
        </Modal>
      )
    }

    case 'bind-confirm': {
      const taken = dialog.object.ownerId !== null && dialog.object.ownerId !== user.id
      return (
        <Modal
          open
          onClose={onClose}
          title="Прив’язати об’єкт?"
          description="Підтвердіть вибір об’єкта для власника."
          actions={
            <>
              <Button
                onClick={() =>
                  taken
                    ? onNext({ kind: 'bind-reassign', object: dialog.object })
                    : onBind(dialog.object)
                }
                disabled={pending}
              >
                Перевірити прив’язку
              </Button>
              {cancel}
            </>
          }
        >
          <DetailRows
            className={styles.dialogRows}
            rows={[
              ['Власник', user.name],
              ['Об’єкт', dialog.object.title],
            ]}
          />
          {error}
        </Modal>
      )
    }

    case 'bind-reassign': {
      const current = ownerName(dialog.object.ownerId)
      return (
        <Modal
          open
          onClose={onClose}
          title="Об’єкт уже має власника"
          description={`${dialog.object.title} прив’язані до іншого власника${current ? ` (${current})` : ''}. Перепризначення змінить доступ обох власників і буде записане в журналі.`}
          actions={
            <>
              <Button
                variant="destructive"
                onClick={() => onBind(dialog.object)}
                disabled={pending}
              >
                Підтвердити перепризначення
              </Button>
              {cancel}
            </>
          }
        >
          {error}
        </Modal>
      )
    }

    case 'unbind':
      return (
        <Modal
          open
          onClose={onClose}
          title="Зняти прив’язку?"
          description={`${user.name} втратить доступ до об’єкта «${dialog.object.title}». Об’єкт і його історія залишаться в каталозі.`}
          actions={
            <>
              <Button
                variant="destructive"
                onClick={() => onUnbind(dialog.object)}
                disabled={pending}
              >
                Зняти прив’язку
              </Button>
              {cancel}
            </>
          }
        >
          {error}
        </Modal>
      )
  }
}
