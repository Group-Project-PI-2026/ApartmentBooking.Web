import { isRouteErrorResponse, useRouteError } from 'react-router'
import { NotFoundPage } from './NotFoundPage'
import { StatusPage } from './StatusPage'

const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|Failed to fetch/i

export function RouteErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  const reload = () => window.location.reload()

  if (error instanceof Error && CHUNK_ERROR.test(error.message)) {
    return (
      <StatusPage
        title="Доступна нова версія"
        text="Сайт оновився, поки сторінка була відкрита. Оновіть сторінку, щоб продовжити."
        onReload={reload}
      />
    )
  }

  return (
    <StatusPage
      title="Щось пішло не так"
      text="Під час відкриття сторінки сталася помилка. Оновіть сторінку або поверніться на головну."
      onReload={reload}
    />
  )
}
