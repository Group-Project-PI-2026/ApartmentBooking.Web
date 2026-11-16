import { Link, Navigate, generatePath } from 'react-router'
import { formatLongDate, toIso } from '@/shared/lib/date'
import { ButtonLink, Container, InfoMessage, Loader, Status } from '@/shared/ui'
import { requestNumber, requestStatus, useMyOwnerRequests } from '../../api/ownerRequests'
import { propertyPaths } from '../../paths'
import { requestStatusLabel, requestStatusTone } from '../../requestStatus'
import styles from './MyRequestsPage.module.css'

const detailsPath = (id: string) => generatePath(propertyPaths.myRequestDetails, { id })

export function MyRequestsPage() {
  const { data: requests, isLoading, isError } = useMyOwnerRequests()

  if (isLoading) {
    return (
      <Container className={styles.page}>
        <Loader />
      </Container>
    )
  }

  if (requests?.length === 1) return <Navigate to={detailsPath(requests[0].id)} replace />

  return (
    <Container className={styles.page}>
      <h1>Мої заявки</h1>

      {isError && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          Не вдалося завантажити заявки.
        </InfoMessage>
      )}

      {requests?.length === 0 && (
        <section className={styles.empty}>
          <h3>Заявок ще немає</h3>
          <p className={styles.muted}>Подайте заявку, щоб запропонувати апартаменти.</p>
          <ButtonLink to={propertyPaths.ownerApply} className={styles.action}>
            Подати заявку
          </ButtonLink>
        </section>
      )}

      {requests && requests.length > 1 && (
        <ul className={styles.list}>
          {requests.map((r) => {
            const status = requestStatus(r.status)
            return (
              <li key={r.id}>
                <Link to={detailsPath(r.id)} className={styles.item}>
                  <span className={styles.number}>{requestNumber(r.number)}</span>
                  <span className={styles.muted}>
                    {r.districtName} район · {r.address}
                  </span>
                  <span className={styles.muted}>
                    {formatLongDate(toIso(new Date(r.createdAt)))}
                  </span>
                  <Status tone={requestStatusTone[status]}>{requestStatusLabel[status]}</Status>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Container>
  )
}
