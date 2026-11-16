import type { ReactNode } from 'react'
import { useParams } from 'react-router'
import { bookingPaths } from '@/features/booking/paths'
import { ApiError } from '@/shared/api/unwrap'
import { formatLongDate, toIso } from '@/shared/lib/date'
import { formatGuests } from '@/shared/lib/format'
import { ButtonLink, Container, InfoMessage, Loader, Status } from '@/shared/ui'
import {
  requestNumber,
  requestStatus,
  useMyOwnerRequest,
  type OwnerRequestDetailsDto,
  type OwnerRequestStatus,
} from '../../api/ownerRequests'
import { requestStatusLabel, requestStatusTone } from '../../requestStatus'
import { ClarificationForm } from './ClarificationForm'
import styles from './MyRequestPage.module.css'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function lastMessage(request: OwnerRequestDetailsDto, status: OwnerRequestStatus) {
  return [...request.history].reverse().find((h) => requestStatus(h.status) === status)?.message
}

function banner(request: OwnerRequestDetailsDto, status: OwnerRequestStatus) {
  switch (status) {
    case 'NeedsClarification':
      return {
        title: 'Потрібне уточнення',
        text: lastMessage(request, status) ?? 'Менеджер надіслав запит на уточнення на email.',
      }
    case 'Approved':
      return {
        title: 'Заявку схвалено',
        text: 'Менеджер зв’яжеться з вами для узгодження подальших дій. Доступ до об’єкта з’явиться після налаштування адміністратором.',
      }
    case 'Rejected': {
      const message = lastMessage(request, status)
      return {
        title: 'Заявку відхилено',
        text: message ? `Коментар менеджера: ${message}` : 'Менеджер відхилив заявку.',
      }
    }
    default:
      return {
        title: 'Заявку отримано',
        text: 'Менеджер розгляне інформацію та повідомить вас про наступні кроки на email.',
      }
  }
}

function historySteps(request: OwnerRequestDetailsDto) {
  const later = request.history
    .slice(1)
    .map((h) => requestStatus(h.status))
    .filter((s) => s !== 'New')
  return ['Заявку подано', 'На розгляді', ...later.map((s) => requestStatusLabel[s])]
}

export function MyRequestPage() {
  const { id = '' } = useParams()
  const { data: request, isLoading, error } = useMyOwnerRequest(id)

  if (isLoading) {
    return (
      <Container className={styles.page}>
        <Loader />
      </Container>
    )
  }

  if (!request) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <Container className={styles.page}>
        <h1>Моя заявка</h1>
        <InfoMessage tone="error" title={notFound ? 'Заявку не знайдено' : 'Спробуйте ще раз'}>
          {notFound
            ? 'Перевірте посилання або відкрийте заявку зі свого кабінету.'
            : 'Не вдалося завантажити заявку.'}
        </InfoMessage>
      </Container>
    )
  }

  const status = requestStatus(request.status)
  const info = banner(request, status)
  const details = [request.title, `до ${formatGuests(request.maxGuests)}`].filter(Boolean)

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <h1>Моя заявка</h1>
        <div className={styles.meta}>
          <span>Номер заявки: {requestNumber(request.number)}</span>
          <span className={styles.muted}>
            Подано {formatLongDate(toIso(new Date(request.createdAt)))}
          </span>
          <Status tone={requestStatusTone[status]}>{requestStatusLabel[status]}</Status>
        </div>
      </header>

      <section className={styles.banner}>
        <h3>{info.title}</h3>
        <p className={styles.muted}>{info.text}</p>
      </section>

      <div className={styles.layout}>
        <div className={styles.main}>
          <Card title="Контактні дані">
            <ul className={styles.lines}>
              <li>{request.contactName}</li>
              <li>{request.contactEmail}</li>
              <li>{request.contactPhone}</li>
            </ul>
          </Card>

          <Card title="Про помешкання">
            <ul className={styles.lines}>
              <li>
                Київ, {request.districtName} район · {request.address}
              </li>
              <li>{details.join(' · ')}</li>
              {request.amenities.length > 0 && <li>{request.amenities.join(' · ')}</li>}
            </ul>
          </Card>

          {request.photoUrls.length > 0 && (
            <Card title="Додані фотографії">
              <ul className={styles.photos}>
                {request.photoUrls.map((url) => (
                  <li key={url}>
                    <img src={url} alt="" className={styles.photo} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {status === 'NeedsClarification' && (
            <Card title="Уточнення за запитом менеджера">
              <ClarificationForm message={info.text} />
            </Card>
          )}
        </div>

        <aside className={styles.aside}>
          <Card title="Історія заявки">
            <ol className={styles.history}>
              {historySteps(request).map((step, i) => (
                <li key={`${step}-${i}`} className={i > 0 ? styles.accent : undefined}>
                  {step}
                </li>
              ))}
            </ol>
          </Card>
          <ButtonLink to={bookingPaths.help} variant="secondary" fullWidth>
            Звернутися по допомогу
          </ButtonLink>
        </aside>
      </div>
    </Container>
  )
}
