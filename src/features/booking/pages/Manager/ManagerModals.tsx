import type { ReactNode } from 'react'
import { generatePath, useNavigate } from 'react-router'
import { formatDateRange } from '@/shared/lib/date'
import { Button, Modal } from '@/shared/ui'
import type { ManagerApartment, ManagerBooking } from '../../api/manager'
import { formatDateTime, paymentLabel, sourceLabel, statusLabel } from '../../managerLabels'
import { bookingPaths } from '../../paths'
import styles from './Manager.module.css'

export function InfoRows({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className={styles.infoRows}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.infoRow}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

interface PanelProps {
  booking: ManagerBooking | null
  apartment?: ManagerApartment
  onClose: () => void
}

export function BookingPanelModal({ booking, apartment, onClose }: PanelProps) {
  const navigate = useNavigate()
  if (!booking) return <Modal open={false} onClose={onClose} title="" />

  if (booking.source === 'ChannelManager') {
    return <ExternalBookingModal booking={booking} apartment={apartment} onClose={onClose} />
  }

  if (booking.status === 'Reserved') {
    return (
      <Modal
        open
        onClose={onClose}
        title="Тимчасовий резерв"
        description="Час резервування обмежено 15 хвилинами."
        actions={
          <Button variant="secondary" onClick={() => navigate(bookingPaths.managerBookings)}>
            До списку бронювань
          </Button>
        }
      >
        <InfoRows
          rows={[
            ['Номер', booking.number],
            ['Об’єкт', apartment?.title ?? '—'],
            ['Створено', `${formatDateTime(booking.createdAt)} (демо)`],
            [
              'Завершення',
              booking.reservedUntil ? `${formatDateTime(booking.reservedUntil)} (демо)` : '—',
            ],
            ['Стан оплати', paymentLabel[booking.payment]],
          ]}
        />
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Бронювання ${booking.number}`}
      description={
        booking.status === 'Cancelled'
          ? 'Скасоване бронювання.'
          : 'Підтверджене бронювання в календарі.'
      }
      actions={
        <>
          <Button
            onClick={() =>
              navigate(generatePath(bookingPaths.managerBookingDetails, { id: booking.id }))
            }
          >
            Відкрити бронювання
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Закрити
          </Button>
        </>
      }
    >
      <InfoRows
        rows={[
          ['Об’єкт', apartment?.title ?? '—'],
          ['Гість', booking.guestName ?? 'Немає даних'],
          ['Дати', formatDateRange(booking.checkIn, booking.checkOut)],
          ['Статус бронювання', statusLabel[booking.status]],
          ['Стан оплати', paymentLabel[booking.payment]],
          ['Джерело', sourceLabel[booking.source]],
        ]}
      />
    </Modal>
  )
}

export function ExternalBookingModal({ booking, apartment, onClose }: PanelProps) {
  if (!booking) return null
  return (
    <Modal
      open
      onClose={onClose}
      title={`Зовнішнє бронювання ${booking.number}`}
      description="Доступні лише дані, отримані від Channel Manager."
      actions={
        <Button variant="secondary" onClick={onClose}>
          До бронювань
        </Button>
      }
    >
      <InfoRows
        rows={[
          ['Об’єкт', apartment?.title ?? '—'],
          ['Дати', formatDateRange(booking.checkIn, booking.checkOut)],
          ['Джерело', sourceLabel[booking.source]],
          ['Оплата', paymentLabel[booking.payment]],
        ]}
      />
      <p className={styles.caption}>
        Повернення платежу через MyRent недоступне: оплату обробляв зовнішній сервіс.
      </p>
    </Modal>
  )
}
