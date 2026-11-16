import { useEffect, useRef, useState } from 'react'
import photoIcon from '@/shared/assets/icons/document.svg'
import { Button } from '@/shared/ui'
import styles from './PhotoPicker.module.css'

interface Photo {
  id: string
  url: string
  name: string
}

export function PhotoPicker() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const urls = useRef(new Set<string>())

  useEffect(() => {
    const current = urls.current
    return () => current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const add = (files: FileList | null) => {
    if (!files) return
    const added = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => {
        const url = URL.createObjectURL(f)
        urls.current.add(url)
        return { id: crypto.randomUUID(), url, name: f.name }
      })
    setPhotos((prev) => [...prev, ...added])
  }

  const remove = (photo: Photo) => {
    URL.revokeObjectURL(photo.url)
    urls.current.delete(photo.url)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
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
          {photos.map((p) => (
            <li key={p.id} className={styles.item}>
              <img src={p.url} alt={p.name} className={styles.preview} />
              <button type="button" className={styles.remove} onClick={() => remove(p)}>
                Видалити фото
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
