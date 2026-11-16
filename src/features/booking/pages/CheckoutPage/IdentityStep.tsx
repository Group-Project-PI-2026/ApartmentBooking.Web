import { useRef, useState, type DragEvent } from 'react'
import { formatFileSize } from '@/shared/lib/format'
import { Button, ButtonLink, InfoMessage } from '@/shared/ui'
import { submitIdentityDocument } from '../../identity'
import styles from './CheckoutPage.module.css'

const icons = import.meta.glob<string>('/src/shared/assets/icons/document.svg', {
  eager: true,
  import: 'default',
})
const documentIcon = Object.values(icons)[0]

const MAX_SIZE = 10 * 1024 * 1024
const ACCEPT = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf']

interface Props {
  apartmentHref: string
  onVerified: () => void
}

export function IdentityStep({ apartmentHref, onVerified }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [sending, setSending] = useState(false)

  const pick = (candidate: File | undefined) => {
    if (!candidate) return
    if (!ACCEPT.includes(candidate.type)) {
      setError('Підтримуються JPG, PNG, HEIC або PDF')
      return
    }
    if (candidate.size > MAX_SIZE) {
      setError('Файл більший за 10 МБ')
      return
    }
    setError('')
    setFile(candidate)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    pick(e.dataTransfer.files[0])
  }

  const submit = async () => {
    if (!file) return
    setSending(true)
    try {
      await submitIdentityDocument(file)
      onVerified()
    } catch {
      setError('Не вдалося надіслати документ. Спробуйте ще раз.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className={styles.card}>
      <h2>Фото документа</h2>

      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {documentIcon && <img src={documentIcon} alt="" width={32} height={32} />}
        <span>Додайте фото документа</span>
        <Button
          variant="secondary"
          className={styles.pickButton}
          onClick={() => inputRef.current?.click()}
        >
          Обрати файл
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(',')}
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      <p className={styles.hint}>Фото має бути чітким, усі дані — видимими</p>

      {error && (
        <InfoMessage tone="error" title="Спробуйте ще раз">
          {error}
        </InfoMessage>
      )}

      {file && (
        <div className={styles.file}>
          <span className={styles.fileThumb}>
            {documentIcon && <img src={documentIcon} alt="" width={16} height={16} />}
          </span>
          <span className={styles.fileInfo}>
            <span>{file.name}</span>
            <span className={styles.fileMeta}>{formatFileSize(file.size)} · Завантажено</span>
          </span>
          <button type="button" className={styles.fileRemove} onClick={() => setFile(null)}>
            Видалити
          </button>
        </div>
      )}

      <div className={styles.actions}>
        <Button className={styles.primaryAction} disabled={!file || sending} onClick={submit}>
          Надіслати на перевірку
        </Button>
        <ButtonLink variant="secondary" to={apartmentHref} className={styles.secondaryAction}>
          До апартаментів
        </ButtonLink>
      </div>
    </section>
  )
}
