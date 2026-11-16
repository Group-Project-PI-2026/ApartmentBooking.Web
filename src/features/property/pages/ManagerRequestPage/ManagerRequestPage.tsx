import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError } from '@/shared/api/unwrap'
import { formatGuests } from '@/shared/lib/format'
import { Button, InfoMessage, Loader, Status, Textarea } from '@/shared/ui'
import { useDecideRequest, useManagerRequest } from '../../api/managerRequests'
import { requestNumber, requestStatus } from '../../api/ownerRequests'
import { DetailRows as Rows } from '../../components/DetailRows/DetailRows'
import { Notice } from '../../components/Notice/Notice'
import { formatSubmitted } from '../../format'
import { propertyPaths } from '../../paths'
import { requestStatusLabel, requestStatusTone } from '../../requestStatus'
import type { RequestsFlash } from '../ManagerRequestsPage/ManagerRequestsPage'
import { DecisionModal, type DecisionAction } from './DecisionModal'
import { historyLines, lastMessage } from './history'
import styles from './ManagerRequestPage.module.css'

const photoSlots = ['Фото 1', 'Фото 2', 'Фото 3']

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export function ManagerRequestPage() {
  const { id = '' } = useParams()
  const { data: request, isLoading, error } = useManagerRequest(id)
  const decide = useDecideRequest(id)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState<string>()
  const [action, setAction] = useState<DecisionAction | null>(null)
  const [done, setDone] = useState<DecisionAction | null>(null)

  if (isLoading) return <Loader />

  if (!request) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <div className={styles.page}>
        <Link to={propertyPaths.managerRequests} className={styles.back}>
          ← До заявок
        </Link>
        <InfoMessage tone="error" title={notFound ? 'Заявку не знайдено' : 'Спробуйте ще раз'}>
          {notFound ? 'Можливо, посилання застаріло.' : 'Не вдалося завантажити заявку.'}
        </InfoMessage>
      </div>
    )
  }

  const status = requestStatus(request.status)
  const number = requestNumber(request.number)
  const open = status === 'New' || status === 'NeedsClarification'
  const rejection = status === 'Rejected' ? lastMessage(request, 'Rejected') : null

  const start = (next: DecisionAction) => {
    if (next !== 'approve' && !comment.trim()) {
      setCommentError(
        next === 'reject' ? 'Вкажіть причину відмови' : 'Вкажіть, що потрібно уточнити',
      )
      return
    }
    decide.reset()
    setAction(next)
  }

  const confirm = (price?: number) => {
    if (!action) return
    const message = comment.trim()
    const decision =
      action === 'approve'
        ? {
            action,
            body: { pricePerNight: price, ...(message && { comment: message }) },
          }
        : { action, message }
    decide.mutate(decision, {
      onSuccess: () => {
        setDone(action)
        setAction(null)
        setComment('')
      },
    })
  }

  const backState: RequestsFlash | undefined = done === 'approve' ? { approved: number } : undefined

  return (
    <div className={styles.page}>
      <Link to={propertyPaths.managerRequests} state={backState} className={styles.back}>
        ← До заявок
      </Link>

      <header className={styles.header}>
        <h1>Заявка {number}</h1>
        <div className={styles.meta}>
          <Status tone={requestStatusTone[status]}>{requestStatusLabel[status]}</Status>
          <span className={styles.caption}>Подано {formatSubmitted(request.createdAt)}</span>
        </div>
      </header>

      {done === 'approve' && (
        <Notice tone="success">
          Заявку схвалено. Повідомлення на email надіслано. Роль власника ще не призначено.
        </Notice>
      )}
      {done === 'reject' && (
        <Notice tone="error">Заявку відхилено. Повідомлення на email надіслано.</Notice>
      )}
      {done === 'clarify' && (
        <Notice tone="success">Запит на уточнення надіслано на email заявника.</Notice>
      )}

      <div className={styles.layout}>
        <div className={styles.column}>
          <Card title="Контакти заявника">
            <Rows
              rows={[
                ['Ім’я', request.contactName],
                [
                  'Email',
                  <a key="email" href={`mailto:${request.contactEmail}`}>
                    {request.contactEmail}
                  </a>,
                ],
                [
                  'Телефон',
                  <a key="phone" href={`tel:${request.contactPhone}`}>
                    {request.contactPhone}
                  </a>,
                ],
              ]}
            />
          </Card>

          <Card title="Помешкання">
            <Rows
              rows={[
                ['Місто', 'Київ'],
                ['Район', `${request.districtName} район`],
                ['Адреса', request.address],
                ['Тип', request.title],
                ['Місткість', formatGuests(request.maxGuests)],
                [
                  'Ціна власника',
                  Number(request.expectedPricePerNight) > 0
                    ? `${request.expectedPricePerNight} ₴ / ніч`
                    : 'Не вказано',
                ],
              ]}
            />
            {request.description && <p className={styles.text}>Опис: {request.description}</p>}
            {request.amenities.length > 0 && (
              <p className={styles.text}>Зручності: {request.amenities.join(', ')}.</p>
            )}
          </Card>

          <Card title="Фотографії">
            <ul className={styles.photos}>
              {request.photoUrls.length > 0
                ? request.photoUrls.map((url, i) => (
                    <li key={url}>
                      <img src={url} alt={`Фото ${i + 1}`} className={styles.photo} />
                    </li>
                  ))
                : photoSlots.map((label) => (
                    <li key={label} className={styles.photoSlot}>
                      {label}
                    </li>
                  ))}
            </ul>
          </Card>
        </div>

        <aside className={styles.column}>
          <Card title="Історія заявки">
            <ul className={styles.history}>
              {historyLines(request).map((line) => (
                <li key={line.key} className={line.muted ? styles.caption : undefined}>
                  {line.text}
                  {line.message && <span className={styles.caption}>«{line.message}»</span>}
                </li>
              ))}
            </ul>
          </Card>

          {rejection && (
            <Card title="Повідомлення заявнику">
              <p className={styles.text}>{rejection}</p>
            </Card>
          )}

          {open && (
            <>
              <Card title="Коментар менеджера">
                <Textarea
                  label="Коментар"
                  placeholder="Введіть коментар"
                  helper="Коментар використовуватиметься у вибраній дії."
                  maxLength={2000}
                  value={comment}
                  error={commentError}
                  className={styles.comment}
                  onChange={(e) => {
                    setComment(e.target.value)
                    setCommentError(undefined)
                  }}
                />
              </Card>

              <Card title="Рішення">
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => start('clarify')}>
                    Запросити уточнення
                  </Button>
                  <Button onClick={() => start('approve')}>Схвалити заявку</Button>
                  <Button variant="destructive" onClick={() => start('reject')}>
                    Відмовити
                  </Button>
                </div>
                <p className={styles.caption}>
                  Рішення менеджера не призначає роль власника і не прив’язує об’єкт.
                </p>
              </Card>
            </>
          )}
        </aside>
      </div>

      <DecisionModal
        action={action}
        expectedPrice={Number(request.expectedPricePerNight)}
        pending={decide.isPending}
        failed={decide.isError}
        onClose={() => setAction(null)}
        onConfirm={confirm}
      />
    </div>
  )
}
