import { useState, type FormEvent } from 'react'
import { addDays, formatDateRange, todayIso } from '@/shared/lib/date'
import { Button, DatePicker, Input, Modal, Select } from '@/shared/ui'
import { useAddBlock, type ManagerApartment } from '../../api/manager'
import { InfoRows } from './ManagerModals'
import styles from './Manager.module.css'

interface Props {
  open: boolean
  onClose: () => void
  apartments: ManagerApartment[]
}

type Step = 'form' | 'done' | 'conflict'

export function BlockDatesModal({ open, onClose, apartments }: Props) {
  const addBlock = useAddBlock()
  const [step, setStep] = useState<Step>('form')
  const [apartmentId, setApartmentId] = useState(apartments[apartments.length - 1]?.id ?? '')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const close = () => {
    setStep('form')
    setErrors({})
    onClose()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!apartmentId) next.apartmentId = 'Оберіть об’єкт'
    if (!from) next.from = 'Оберіть дату'
    if (!to) next.to = 'Оберіть дату'
    if (!reason.trim()) next.reason = 'Вкажіть причину'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    addBlock.mutate(
      { apartmentId, from, to, reason: reason.trim() },
      { onSuccess: () => setStep('done'), onError: () => setStep('conflict') },
    )
  }

  const apartment = apartments.find((a) => a.id === apartmentId)

  if (step === 'done') {
    return (
      <Modal
        open={open}
        onClose={close}
        title="Дати заблоковано"
        description="Технічне блокування додано до календаря. Це демонстраційний стан."
        actions={
          <Button variant="secondary" onClick={close}>
            До календаря
          </Button>
        }
      >
        <InfoRows
          rows={[
            ['Об’єкт', apartment?.title ?? '—'],
            ['Період', formatDateRange(from, to)],
            ['Причина', reason],
          ]}
        />
      </Modal>
    )
  }

  if (step === 'conflict') {
    return (
      <Modal
        open={open}
        onClose={close}
        title="Не вдалося заблокувати дати"
        description="Обраний період зайнятий. Перевірте календар і виберіть інші дати."
        actions={
          <>
            <Button onClick={() => setStep('form')}>Змінити дати</Button>
            <Button variant="secondary" onClick={close}>
              До календаря
            </Button>
          </>
        }
      />
    )
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Блокування дат"
      description="Вкажіть об’єкт, вільний період і причину."
    >
      <form className={styles.modalForm} onSubmit={submit} noValidate>
        <Select
          label="Об’єкт"
          options={apartments.map((a) => ({ value: a.id, label: a.title }))}
          value={apartmentId}
          onChange={(e) => setApartmentId(e.target.value)}
          error={errors.apartmentId}
        />
        <div className={styles.twoCols}>
          <DatePicker
            label="Початок"
            value={from}
            min={todayIso()}
            rangeStart={from}
            rangeEnd={to}
            onChange={(v) => {
              setFrom(v)
              if (to && to <= v) setTo('')
            }}
            error={errors.from}
          />
          <DatePicker
            label="Кінець"
            value={to}
            min={addDays(from || todayIso(), 1)}
            rangeStart={from}
            rangeEnd={to}
            onChange={setTo}
            error={errors.to}
          />
        </div>
        <Input
          label="Причина"
          placeholder="Технічне обслуговування"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={errors.reason}
        />
        <div className={styles.modalActions}>
          <Button type="submit" disabled={addBlock.isPending}>
            Заблокувати дати
          </Button>
          <Button variant="secondary" onClick={close}>
            Скасувати
          </Button>
        </div>
      </form>
    </Modal>
  )
}
