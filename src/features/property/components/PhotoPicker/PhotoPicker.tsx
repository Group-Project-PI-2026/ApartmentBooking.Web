import { useEffect, useRef, useState } from 'react'
import photoIcon from '@/shared/assets/icons/document.svg'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui'
import styles from './PhotoPicker.module.css'

export interface PickedPhoto {
  id: string
  url: string
  name: string
}

interface Props {
  value?: PickedPhoto[]
  onChange?: (photos: PickedPhoto[]) => void
  ordering?: boolean
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function PhotoPicker({ value, onChange, ordering = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [own, setOwn] = useState<PickedPhoto[]>([])
  const photos = value ?? own
  const created = useRef(new Set<string>())

  useEffect(() => {
    const urls = created.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const update = (next: PickedPhoto[]) => {
    if (!value) setOwn(next)
    onChange?.(next)
  }

  const add = (files: FileList | null) => {
    if (!files) return
    const added = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => {
        const url = URL.createObjectURL(f)
        created.current.add(url)
        return { id: crypto.randomUUID(), url, name: f.name }
      })
    update([...photos, ...added])
  }

  const remove = (photo: PickedPhoto) => {
    if (created.current.delete(photo.url)) URL.revokeObjectURL(photo.url)
    update(photos.filter((p) => p.id !== photo.id))
  }

  return (
    <div className={styles.picker}>
      <div
        className={styles.dropzone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          add(e.dataTransfer.files)
        }}
      >
        <img src={photoIcon} alt="" className={styles.icon} />
        <span>Додайте фотографії апартаментів</span>
        <Button
          variant="secondary"
          className={styles.add}
          onClick={() => inputRef.current?.click()}
        >
          Додати фото
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            add(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {photos.length > 0 && (
        <ul className={styles.list}>
          {photos.map((p, i) => (
            <li key={p.id} className={cn(styles.item, ordering && styles.bordered)}>
              <img src={p.url} alt={p.name} className={styles.preview} />
              {ordering &&
                (i === 0 ? (
                  <span className={styles.main}>Головне фото</span>
                ) : (
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => update(move(photos, i, 0))}
                  >
                    Зробити головним
                  </button>
                ))}
              <div className={styles.controls}>
                {ordering && (
                  <>
                    <button
                      type="button"
                      className={styles.link}
                      disabled={i === 0}
                      onClick={() => update(move(photos, i, i - 1))}
                    >
                      Ліворуч
                    </button>
                    <button
                      type="button"
                      className={styles.link}
                      disabled={i === photos.length - 1}
                      onClick={() => update(move(photos, i, i + 1))}
                    >
                      Праворуч
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className={cn(styles.link, ordering && styles.danger)}
                  onClick={() => remove(p)}
                >
                  Видалити фото
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
