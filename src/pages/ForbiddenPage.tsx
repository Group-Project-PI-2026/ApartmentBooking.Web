import { StatusPage } from './StatusPage'

export function ForbiddenPage() {
  return (
    <StatusPage
      title="Немає доступу"
      text="У вас немає доступу до цього розділу. Поверніться на головну сторінку, щоб продовжити."
    />
  )
}
