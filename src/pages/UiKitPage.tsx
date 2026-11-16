import { useState, type ReactNode } from 'react'
import {
  BookingSteps,
  Button,
  Container,
  Input,
  Logo,
  Modal,
  Pagination,
  PasswordInput,
  Select,
  Status,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Tabs,
  Textarea,
  type ButtonVariant,
} from '@/shared/ui'
import styles from './UiKitPage.module.css'

const variants: ButtonVariant[] = ['primary', 'secondary', 'text', 'destructive']
const districts = [
  { value: '1', label: 'Голосіївський' },
  { value: '2', label: 'Подільський' },
]
const tableColumns = [
  { key: 'number', title: 'Номер' },
  { key: 'apartment', title: 'Апартаменти', width: '30%' },
  { key: 'guest', title: 'Гість' },
  { key: 'status', title: 'Статус' },
  { key: 'balance', title: 'Залишок' },
  { key: 'action', title: 'Дія' },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      {children}
    </section>
  )
}

export function UiKitPage() {
  const [tab, setTab] = useState('future')
  const [page, setPage] = useState(1)
  const [district, setDistrict] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Container className={styles.page}>
      <h1>UI Kit</h1>

      <Section title="Логотип">
        <div className={styles.row}>
          <Logo />
          <Logo variant="dark" />
          <Logo variant="mark" />
        </div>
      </Section>

      <Section title="Кнопки">
        <div className={styles.buttons}>
          {variants.map((v) => (
            <div key={v} className={styles.column}>
              <Button variant={v}>Дія</Button>
              <Button variant={v} disabled>
                Дія
              </Button>
            </div>
          ))}
        </div>
        <Button size="compact">Деталі</Button>
      </Section>

      <Section title="Поля">
        <div className={styles.fields}>
          <Input
            label="Електронна пошта"
            placeholder="name@example.com"
            helper="Вкажіть адресу електронної пошти"
          />
          <Input label="Електронна пошта" placeholder="name@example.com" error="Поле обов’язкове" />
          <Input
            label="Електронна пошта"
            placeholder="name@example.com"
            helper="Вкажіть адресу електронної пошти"
            disabled
          />
          <Select
            label="Район Києва"
            placeholder="Оберіть район"
            helper="Лише Київ"
            options={districts}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <Select
            label="Район Києва"
            placeholder="Оберіть район"
            error="Поле обов’язкове"
            options={districts}
          />
          <Select
            label="Район Києва"
            placeholder="Оберіть район"
            helper="Лише Київ"
            options={districts}
            disabled
          />
          <PasswordInput label="Пароль" placeholder="Пароль" helper="Мінімум 8 символів" />
          <PasswordInput label="Пароль" placeholder="Пароль" error="Мінімум 8 символів" />
          <PasswordInput label="Пароль" placeholder="Пароль" helper="Мінімум 8 символів" disabled />
          <Textarea label="Опис" placeholder="Розкажіть про апартаменти" />
          <Textarea label="Опис" placeholder="Розкажіть про апартаменти" error="Поле обов’язкове" />
          <Textarea label="Опис" placeholder="Розкажіть про апартаменти" disabled />
        </div>
      </Section>

      <Section title="Модальне вікно">
        <Button onClick={() => setModalOpen(true)}>Відкрити</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Підтвердити дію?"
          description="Перевірте інформацію перед продовженням."
          actions={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={() => setModalOpen(false)}>Підтвердити</Button>
            </>
          }
        />
      </Section>

      <Section title="Таблиця">
        <Table className={styles.stretch}>
          <TableHeader columns={tableColumns} />
          <TableBody>
            <TableRow>
              <TableCell>KY-00124</TableCell>
              <TableCell>Апартаменти на Подолі</TableCell>
              <TableCell>Андрій Коваль</TableCell>
              <TableCell>
                <Status tone="success">Підтверджено</Status>
              </TableCell>
              <TableCell>2 700 ₴</TableCell>
              <TableCell>
                <Button size="compact" fullWidth>
                  Деталі
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      <Section title="Tabs, Pagination, BookingSteps">
        <Tabs
          label="Бронювання"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'future', label: 'Майбутні' },
            { value: 'past', label: 'Минулі' },
            { value: 'cancelled', label: 'Скасовані' },
          ]}
        />
        <Pagination page={page} totalPages={3} onChange={setPage} />
        <BookingSteps steps={['Перевірка особи', 'Дані й оплата', 'Підтвердження']} current={2} />
      </Section>
    </Container>
  )
}
