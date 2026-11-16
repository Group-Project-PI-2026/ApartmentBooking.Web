import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { nightsBetween } from '@/shared/lib/date'
import { Button, Container, Loader, Pagination, Select } from '@/shared/ui'
import { useApartments, useDistricts } from '../../api/apartments'
import { ApartmentListItem } from '../../components/ApartmentListItem/ApartmentListItem'
import { SearchForm } from '../../components/SearchForm/SearchForm'
import { readSearch } from '../../searchQuery'
import {
  applyFilters,
  collectAmenities,
  emptyFilters,
  hasFilters,
  sortOptions,
  type Filters,
  type SortOrder,
} from './filters'
import { FiltersPanel } from './FiltersPanel'
import styles from './SearchPage.module.css'

const PAGE_SIZE = 10

export function SearchPage() {
  const [params] = useSearchParams()
  const search = readSearch(params)
  const { data: districts = [] } = useDistricts()
  const {
    data = [],
    isLoading,
    isError,
  } = useApartments({
    districtId: search.districtId,
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    guestsCount: search.guests,
  })

  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [sort, setSort] = useState<SortOrder>('recommended')
  const [page, setPage] = useState(1)

  const results = useMemo(() => applyFilters(data, filters, sort), [data, filters, sort])
  const amenities = useMemo(() => collectAmenities(data), [data])
  const totalPages = Math.ceil(results.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(totalPages, 1))
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasDates = Boolean(search.checkIn && search.checkOut)
  const nights = hasDates ? nightsBetween(search.checkIn, search.checkOut) : undefined
  const linkParams = new URLSearchParams()
  if (search.checkIn) linkParams.set('checkIn', search.checkIn)
  if (search.checkOut) linkParams.set('checkOut', search.checkOut)
  if (search.guests) linkParams.set('guests', search.guests)
  const linkSearch = linkParams.size ? `?${linkParams}` : ''

  const updateFilters = (next: Filters) => {
    setFilters(next)
    setPage(1)
  }

  const resetFilters = () => updateFilters(emptyFilters)

  const changePage = (next: number) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Container className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.intro}>
          <h1>Апартаменти у Києві</h1>
          <p className={styles.lead}>
            Знайдіть ідеальне житло для своєї поїздки. Оберіть дати, кількість гостей і перегляньте
            доступні варіанти.
          </p>
        </div>
        <SearchForm
          key={params.toString()}
          initial={search}
          submitLabel="Знайти"
          allDistrictsLabel="Усі райони"
        />
      </section>

      <div className={styles.layout}>
        <FiltersPanel
          value={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          districts={districts}
          amenities={amenities}
        />

        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <h2>{hasDates ? 'Доступні варіанти на вибрані дати' : 'Доступні варіанти'}</h2>
            <Select
              label="Сортувати"
              className={styles.sort}
              options={sortOptions}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOrder)}
            />
          </div>

          {isLoading && <Loader />}
          {isError && (
            <p className={styles.error}>Не вдалося завантажити апартаменти. Спробуйте ще раз.</p>
          )}

          {!isLoading && !isError && visible.length === 0 && (
            <div className={styles.empty}>
              <h3>Немає варіантів</h3>
              <p className={styles.lead}>
                Змініть дати або фільтри, щоб побачити більше апартаментів.
              </p>
              {hasFilters(filters) && (
                <Button variant="secondary" onClick={resetFilters}>
                  Скинути фільтри
                </Button>
              )}
            </div>
          )}

          <div className={styles.list}>
            {visible.map((a) => (
              <ApartmentListItem key={a.id} apartment={a} nights={nights} linkSearch={linkSearch} />
            ))}
          </div>

          <Pagination
            className={styles.pagination}
            page={currentPage}
            totalPages={totalPages}
            onChange={changePage}
          />
        </section>
      </div>
    </Container>
  )
}
