import { useState } from 'react'
import { Button, InfoMessage, Input, Modal } from '@/shared/ui'

export type DecisionAction = 'approve' | 'reject' | 'clarify'

const copy: Record<
  DecisionAction,
  { title: string; description: string; confirm: string; destructive?: boolean }
> = {
  approve: {
    title: 'Схвалити заявку?',
    description:
      'Схвалення не призначає роль власника автоматично. Після підготовки об’єкта адміністратор налаштує доступ.',
    confirm: 'Схвалити',
  },
  clarify: {
    title: 'Запросити уточнення?',
    description: 'Заявник отримає ваш коментар на email і зможе доповнити заявку.',
    confirm: 'Надіслати запит',
  },
  reject: {
    title: 'Відмовити у співпраці?',
    description: 'Заявник отримає ваш коментар на email. Цю дію не можна скасувати.',
    confirm: 'Відмовити',
    destructive: true,
  },
}

interface Props {
  action: DecisionAction | null
  expectedPrice: number
  pending: boolean
  failed: boolean
  onClose: () => void
  onConfirm: (price?: number) => void
}

export function DecisionModal({
  action,
  expectedPrice,
  pending,
  failed,
  onClose,
  onConfirm,
}: Props) {
  const [price, setPrice] = useState('')
  const [priceError, setPriceError] = useState<string>()
  const text = action ? copy[action] : copy.approve

  const confirm = () => {
    if (action !== 'approve') return onConfirm()
    const value = Number(price || expectedPrice)
    if (!value || value <= 0) {
      setPriceError('Вкажіть ціну за ніч')
      return
    }
    onConfirm(value)
  }

  return (
    <Modal
      open={action !== null}
      onClose={onClose}
      title={text.title}
      description={text.description}
      actions={
        <>
          <Button
            variant={text.destructive ? 'destructive' : 'primary'}
            onClick={confirm}
            disabled={pending}
          >
            {text.confirm}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Скасувати
          </Button>
        </>
      }
    >
      {action === 'approve' && (
        <Input
          label="Ціна за ніч, ₴"
          type="number"
          min={1}
          inputMode="numeric"
          placeholder={expectedPrice > 0 ? String(expectedPrice) : 'Наприклад, 1800'}
          value={price}
          error={priceError}
          onChange={(e) => {
            setPrice(e.target.value)
            setPriceError(undefined)
          }}
        />
      )}
      {failed && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося зберегти рішення.
        </InfoMessage>
      )}
    </Modal>
  )
}
