import { useEffect, useState } from 'react'
import chevronRight from '@/shared/assets/icons/chevron-right.svg'
import styles from './ApartmentPage.module.css'

interface Props {
  photos: string[]
  title: string
}

export function Gallery({ photos, title }: Props) {
  const [viewer, setViewer] = useState<number | null>(null)
  const tiles = Array.from({ length: 4 }, (_, i) => photos[i + 1])

  useEffect(() => {
    if (viewer === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewer(null)
      if (e.key === 'ArrowRight') setViewer((v) => (v === null ? v : (v + 1) % photos.length))
      if (e.key === 'ArrowLeft')
        setViewer((v) => (v === null ? v : (v - 1 + photos.length) % photos.length))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [viewer, photos.length])

  return (
    <>
      <div className={styles.gallery}>
        {photos[0] ? (
          <button type="button" className={styles.mainPhoto} onClick={() => setViewer(0)}>
            <img src={photos[0]} alt={title} />
          </button>
        ) : (
          <div className={styles.mainPhoto} />
        )}
        <div className={styles.tiles}>
          {tiles.map((src, i) => {
            const isLast = i === tiles.length - 1
            if (isLast && photos.length > 0) {
              return (
                <button
                  key="all"
                  type="button"
                  className={`${styles.tile} ${styles.allPhotos}`}
                  onClick={() => setViewer(0)}
                >
                  {src && <img src={src} alt="" />}
                  <span>Усі фото ({photos.length})</span>
                </button>
              )
            }
            return src ? (
              <button
                key={i}
                type="button"
                className={styles.tile}
                onClick={() => setViewer(i + 1)}
              >
                <img src={src} alt="" />
              </button>
            ) : (
              <div key={i} className={styles.tile} />
            )
          })}
        </div>
      </div>

      {viewer !== null && (
        <div
          className={styles.viewer}
          role="dialog"
          aria-modal="true"
          aria-label={`Фото: ${title}`}
          onClick={() => setViewer(null)}
        >
          <img
            src={photos[viewer]}
            alt=""
            className={styles.viewerPhoto}
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.viewerNav} ${styles.viewerPrev}`}
                aria-label="Попереднє фото"
                onClick={(e) => {
                  e.stopPropagation()
                  setViewer((viewer - 1 + photos.length) % photos.length)
                }}
              >
                <img src={chevronRight} alt="" />
              </button>
              <button
                type="button"
                className={`${styles.viewerNav} ${styles.viewerNext}`}
                aria-label="Наступне фото"
                onClick={(e) => {
                  e.stopPropagation()
                  setViewer((viewer + 1) % photos.length)
                }}
              >
                <img src={chevronRight} alt="" />
              </button>
            </>
          )}
          <span className={styles.viewerCounter}>
            {viewer + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  )
}
