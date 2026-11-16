import { InfoMessage } from '@/shared/ui'

export function DemoNotice() {
  return (
    <InfoMessage tone="warning" title="Демонстраційні дані">
      Бекенд для календаря й бронювань менеджера ще не готовий. Дії працюють лише до
      перезавантаження сторінки.
    </InfoMessage>
  )
}
