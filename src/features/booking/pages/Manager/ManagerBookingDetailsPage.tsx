import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { formatLongDate, nightsBetween, todayIso } from '@/shared/lib/date'
import { formatGuests, formatNights, formatPrice } from '@/shared/lib/format'
import {
  Button,
  ButtonLink,
  ComingSoon,
  Loader,
  Modal,
  Status,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Textarea,
} from '@/shared/ui'
import {
  refundFor,
  useManagerApartments,
  useManagerBooking,
  useUpdateBooking,
} from '../../api/manager'
import { DemoNotice } from '../../components/DemoNotice/DemoNotice'
import {
  formatDateTime,
  paymentLabel,
  sourceLabel,
  statusLabel,
  statusTone,
} from '../../managerLabels'
import { bookingPaths } from '../../paths'
import { InfoRows } from './ManagerModals'
import styles from './Manager.module.css'

type Dialog =
  'checkIn' | 'checkInDone' | 'checkOut' | 'checkOutDone' | 'cancel' | 'cancelDone' | null

const historyColumns = [
  { key: 'at', title: 'Дата й час', width: '16%' },
  { key: 'actor', title: 'Виконавець', width: '17%' },
  { key: 'action', title: 'Дія' },
]

export function ManagerBookingDetailsPage() {
  const { id = '' } = useParams()
  const booking = useManagerBooking(id)
  const apartments = useManagerApartments()
  const update = useUpdateBooking(id)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [note, setNote] = useState<string | null>(null)
  const [noteSaved, setNoteSaved] = useState(false)

  if (booking.isLoading) return <Loader />
  const b = booking.data
  if (!b) return <NotFoundPage />

  const apartment = apartments.data?.find((a) => a.id === b.apartmentId)
  const today = todayIso()
  const nights = nightsBetween(b.checkIn, b.checkOut)
  const refund = refundFor(b, today)
  const active = b.status === 'Confirmed' && b.source === 'Internal'
  const canCheckIn = active && !b.checkedInAt && b.checkIn <= today
  const canCheckOut = active && Boolean(b.checkedInAt) && !b.checkedOutAt
  const canCancel = b.status !== 'Cancelled' && b.source === 'Internal' && !b.checkedInAt
  const noteValue = note ?? b.note

  const markCheckIn = () =>
    update.mutate(
      { patch: { checkedInAt: new Date().toISOString() }, action: 'Позначено заселення' },
      { onSuccess: () => setDialog('checkInDone') },
    )

  const markCheckOut = () =>
    update.mutate(
      { patch: { checkedOutAt: new Date().toISOString() }, action: 'Позначено виїзд' },
      { onSuccess: () => setDialog('checkOutDone') },
    )

  const cancel = () =>
    update.mutate(
      {
        patch: { status: 'Cancelled', payment: 'Refunding', refund: refund.refund, balance: null },
        action: `Бронювання скасовано менеджером, до повернення ${formatPrice(refund.refund)}`,
      },
      { onSuccess: () => setDialog('cancelDone') },
    )

  const saveNote = () =>
    update.mutate(
      { patch: { note: noteValue }, action: 'Оновлено службову примітку' },
      { onSuccess: () => setNoteSaved(true) },
    )

  const instructionsAvailable = b.checkIn <= today && b.status === 'Confirmed'

  return (
    <div className={styles.page}>
      <Link to={bookingPaths.managerBookings} className={styles.back}>
        ← До бронювань
      </Link>
      <div className={styles.titleRow}>
        <h1>Бронювання {b.number}</h1>
        <ComingSoon />
      </div>
      <div className={styles.statusRow}>
        <Status tone={statusTone[b.status]}>{statusLabel[b.status]}</Status>
        <Status tone="pending">{paymentLabel[b.payment]}</Status>
      </div>
      <DemoNotice />

      <div className={styles.detailsColumns}>
        <div className={styles.column}>
          <section className={styles.card}>
            <h2>{apartment?.title ?? '—'}</h2>
            <div className={styles.photo} />
            {apartment && (
              <span className={styles.muted}>
                Київ, {apartment.districtName} район · {apartment.rooms} кімната ·{' '}
                {formatGuests(b.guests)}
              </span>
            )}
          </section>

          <section className={styles.card}>
            <h2>Дати та гості</h2>
            <InfoRows
              rows={[
                ['Заїзд', `${formatLongDate(b.checkIn)}, після 15:00`],
                ['Виїзд', `${formatLongDate(b.checkOut)}, до 11:00`],
                ['Тривалість', `${formatNights(nights)} · ${formatGuests(b.guests)}`],
              ]}
            />
          </section>

          <section className={styles.card}>
            <h2>Гість</h2>
            <InfoRows
              rows={[
                ['Ім’я', b.guestName ?? 'Немає даних'],
                ['Email', b.guestEmail ?? 'Немає даних'],
                ['Телефон', b.guestPhone ?? 'Немає даних'],
                ['Перевірка особи', b.identityVerified ? 'Підтверджено' : 'Не підтверджено'],
              ]}
            />
          </section>

          <section className={styles.card}>
            <h2>Службова примітка</h2>
            <Textarea
              label="Примітка"
              className={styles.note}
              placeholder="Додайте службову примітку"
              value={noteValue}
              onChange={(e) => {
                setNote(e.target.value)
                setNoteSaved(false)
              }}
            />
            <div className={styles.inlineActions}>
              <Button
                variant="secondary"
                className={styles.noteButton}
                onClick={saveNote}
                disabled={update.isPending}
              >
                Зберегти примітку
              </Button>
              {noteSaved && <span className={styles.successText}>Примітку збережено (демо)</span>}
            </div>
          </section>
        </div>

        <div className={styles.column}>
          <section className={styles.card}>
            <h2>Оплата</h2>
            <InfoRows
              rows={[
                ['Вартість', b.total != null ? formatPrice(b.total) : 'Немає даних'],
                ['Сплачено', b.paid != null ? formatPrice(b.paid) : 'Немає даних'],
                ['Залишок', b.balance != null ? formatPrice(b.balance) : 'Немає даних'],
                ['Строк доплати', b.balance ? 'У день заселення' : '—'],
              ]}
            />
            <span className={styles.caption}>
              Платіж змінюється лише після підтвердження платіжного сервісу.
            </span>
            <h3>Історія платежів і повернень</h3>
            {b.paid ? (
              <span className={styles.caption}>
                {formatDateTime(b.createdAt).split(',')[0]} ·{' '}
                {b.payment === 'Paid' ? 'Повна оплата' : 'Передоплата'} {formatPrice(b.paid)} ·
                Підтверджено
              </span>
            ) : (
              <span className={styles.caption}>Платежів немає</span>
            )}
            <span className={styles.caption}>
              {b.refund ? `Повернення ${formatPrice(b.refund)} · Оформлюється` : 'Повернень немає'}
            </span>
          </section>

          <section className={styles.card}>
            <h2>Заселення</h2>
            <InfoRows
              rows={[
                ['Інструкції', instructionsAvailable ? 'Доступні гостю' : 'Ще недоступні'],
                ['Відкриття', 'Вранці в день заселення'],
                ['Email', instructionsAvailable ? 'Надіслано' : 'Надсилання заплановано'],
                ...(b.checkedInAt
                  ? ([['Заселення', formatDateTime(b.checkedInAt)]] as Array<[string, string]>)
                  : []),
                ...(b.checkedOutAt
                  ? ([['Виїзд', formatDateTime(b.checkedOutAt)]] as Array<[string, string]>)
                  : []),
              ]}
            />
            {canCheckIn && (
              <Button className={styles.cardAction} onClick={() => setDialog('checkIn')}>
                Позначити заселення
              </Button>
            )}
            {canCheckOut && (
              <Button className={styles.cardAction} onClick={() => setDialog('checkOut')}>
                Позначити виїзд
              </Button>
            )}
          </section>

          <section className={styles.card}>
            <h2>Джерело та синхронізація</h2>
            <InfoRows
              rows={[
                ['Джерело', sourceLabel[b.source]],
                [
                  'Синхронізація',
                  b.source === 'Internal' ? 'Не застосовується' : 'Channel Manager',
                ],
                ['Останнє оновлення', `${formatDateTime(b.history[0]?.at ?? b.createdAt)} (демо)`],
              ]}
            />
          </section>
        </div>
      </div>

      <section className={styles.card}>
        <h2>Історія дій</h2>
        <Table className={styles.historyTable}>
          <TableHeader columns={historyColumns} />
          <TableBody>
            {b.history.map((h, i) => (
              <TableRow key={`${h.at}-${i}`}>
                <TableCell>{formatDateTime(h.at)}</TableCell>
                <TableCell>{h.actor}</TableCell>
                <TableCell>{h.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {canCancel && (
        <Button
          variant="destructive"
          className={styles.cardAction}
          onClick={() => setDialog('cancel')}
        >
          Скасувати бронювання
        </Button>
      )}

      <Modal
        open={dialog === 'checkIn'}
        onClose={() => setDialog(null)}
        title="Позначити заселення?"
        description={`Підтвердьте факт заселення для бронювання ${b.number}.`}
        actions={
          <>
            <Button onClick={markCheckIn} disabled={update.isPending}>
              Позначити заселення
            </Button>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Скасувати
            </Button>
          </>
        }
      >
        <InfoRows rows={[['Заїзд', `${formatLongDate(b.checkIn)}, після 15:00`]]} />
      </Modal>

      <Modal
        open={dialog === 'checkInDone' || dialog === 'checkOutDone'}
        onClose={() => setDialog(null)}
        className={styles.successModal}
        title={dialog === 'checkOutDone' ? 'Виїзд позначено' : 'Заселення позначено'}
        description={`Подію для бронювання ${b.number} додано до історії дій.`}
        actions={
          <Button variant="secondary" onClick={() => setDialog(null)}>
            До бронювання
          </Button>
        }
      />

      <Modal
        open={dialog === 'checkOut'}
        onClose={() => setDialog(null)}
        title="Позначити виїзд?"
        description="Ця дія доступна після заселення та завершення проживання."
        actions={
          <>
            <Button onClick={markCheckOut} disabled={update.isPending}>
              Позначити виїзд
            </Button>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Скасувати
            </Button>
          </>
        }
      >
        <InfoRows rows={[['Виїзд', `${formatLongDate(b.checkOut)}, до 11:00`]]} />
      </Modal>

      <Modal
        open={dialog === 'cancel'}
        onClose={() => setDialog(null)}
        title="Скасувати бронювання?"
        description={`Розрахунок за ${Math.max(nightsBetween(today, b.checkIn), 0)} дн. до заїзду.`}
        actions={
          <>
            <Button variant="destructive" onClick={cancel} disabled={update.isPending}>
              Підтвердити скасування
            </Button>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Зберегти бронювання
            </Button>
          </>
        }
      >
        <InfoRows
          rows={[
            ['Вартість', formatPrice(refund.total)],
            ['Сплачено', formatPrice(refund.paid)],
            [`Утримання ${refund.penaltyPercent}%`, formatPrice(refund.penalty)],
            ['До повернення', formatPrice(refund.refund)],
          ]}
        />
      </Modal>

      <Modal
        open={dialog === 'cancelDone'}
        onClose={() => setDialog(null)}
        className={styles.successModal}
        title="Бронювання скасовано"
        description={`Повернення ${formatPrice(b.refund ?? 0)} оформлюється. Кошти буде повернуто на спосіб оплати, використаний для платежу.`}
        actions={
          <ButtonLink variant="secondary" to={bookingPaths.managerBookings}>
            До бронювань
          </ButtonLink>
        }
      />
    </div>
  )
}
