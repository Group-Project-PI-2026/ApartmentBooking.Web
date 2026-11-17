import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApartmentCardDto } from '@/features/booking/api/apartments'
import { ApartmentCard } from '@/features/booking/components/ApartmentCard/ApartmentCard'
import { SearchForm } from '@/features/booking/components/SearchForm/SearchForm'
import { Header } from '@/layouts/Header'
import { RequireAuth } from '@/shared/auth/RequireAuth'
import { Button } from '@/shared/ui/Button/Button'
import { Pagination } from '@/shared/ui/Pagination/Pagination'

vi.mock('@/features/booking/api/apartments', () => ({
  useDistricts: () => ({
    data: [
      { id: 6, name: 'Печерський' },
      { id: 7, name: 'Подільський' },
    ],
  }),
}))

const auth = {
  isLoading: false,
  isAuthenticated: true,
  roles: ['tenant'] as string[],
  login: vi.fn(),
  logout: vi.fn(),
}
vi.mock('@/shared/auth/useCurrentUser', () => ({
  useCurrentUser: () => ({
    ...auth,
    hasRole: (...required: string[]) =>
      auth.roles.includes('admin') || required.some((r) => auth.roles.includes(r)),
  }),
}))

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

describe('<Header> (BUG-FE-006 fixed)', () => {
  beforeEach(() => {
    auth.isAuthenticated = true
    auth.logout.mockClear()
  })

  it('signed-in user has a "Вийти" button that calls logout', async () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    const buttons = screen.getAllByRole('button', { name: 'Вийти', hidden: true })
    await userEvent.click(buttons[0])
    expect(auth.logout).toHaveBeenCalledTimes(1)
  })

  it('anonymous user sees "Увійти" and no "Вийти"', () => {
    auth.isAuthenticated = false
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    expect(screen.queryAllByRole('button', { name: 'Вийти', hidden: true })).toHaveLength(0)
    expect(screen.getAllByRole('button', { name: 'Увійти', hidden: true }).length).toBeGreaterThan(
      0,
    )
  })
})

describe('<Button>', () => {
  it('is type="button" by default (does not submit forms accidentally)', () => {
    render(<Button>Зберегти</Button>)
    expect(screen.getByRole('button', { name: 'Зберегти' })).toHaveAttribute('type', 'button')
  })

  it('calls onClick and respects disabled', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Ок</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Button onClick={onClick} disabled>
        Ок
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('<Pagination>', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('marks the current page and goes to the next one', async () => {
    const onChange = vi.fn()
    render(<Pagination page={2} totalPages={3} onChange={onChange} />)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(screen.getByRole('button', { name: /Наступна/ }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('hides "Наступна" on the last page', () => {
    render(<Pagination page={3} totalPages={3} onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: /Наступна/ })).not.toBeInTheDocument()
  })
})

describe('<ApartmentCard>', () => {
  const apartment = {
    id: '11111111-1111-1111-1111-111111111111',
    photoUrl: 'https://picsum.photos/seed/x/800/600',
    title: 'Студія біля Лаври',
    districtId: 6,
    districtName: 'Печерський',
    pricePerNight: 1800,
    totalPrice: null,
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Кухня'],
  } as ApartmentCardDto

  it('shows title, district, guests, amenities, price and link to details', () => {
    render(
      <MemoryRouter>
        <ApartmentCard apartment={apartment} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Студія біля Лаври' })).toBeInTheDocument()
    expect(screen.getByText('Київ · Печерський район')).toBeInTheDocument()
    expect(screen.getByText('2 гості')).toBeInTheDocument()
    expect(screen.getByText('Wi-Fi · Кухня')).toBeInTheDocument()
    expect(screen.getByText(/від 1\s800 ₴ \/ ніч/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Переглянути' })).toHaveAttribute(
      'href',
      `/apartments/${apartment.id}`,
    )
  })

  it('renders a placeholder when there is no photo and no amenities', () => {
    const { container } = render(
      <MemoryRouter>
        <ApartmentCard apartment={{ ...apartment, photoUrl: null, amenities: [] }} />
      </MemoryRouter>,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(screen.queryByText('Wi-Fi · Кухня')).not.toBeInTheDocument()
  })
})

describe('<SearchForm>', () => {
  const renderForm = (initial?: Parameters<typeof SearchForm>[0]['initial']) =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SearchForm initial={initial} />} />
          <Route path="/apartments" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    )

  it('loads Kyiv districts into the select', () => {
    renderForm()
    expect(screen.getByRole('option', { name: 'Печерський' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Подільський' })).toBeInTheDocument()
  })

  it('submits selected district and guests into the search URL', async () => {
    renderForm()
    await userEvent.selectOptions(screen.getByLabelText('Район Києва'), '7')
    await userEvent.type(screen.getByLabelText('Гості'), '3')
    await userEvent.click(screen.getByRole('button', { name: 'Знайти апартаменти' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/apartments?districtId=7&guests=3')
  })

  it('guests field keeps digits only and clamps to 1..50', async () => {
    renderForm()
    const guests = screen.getByLabelText('Гості')
    await userEvent.type(guests, 'a9b9')
    expect(guests).toHaveValue('50')
    await userEvent.clear(guests)
    await userEvent.type(guests, '0')
    expect(guests).toHaveValue('1')
  })

  it('requires check-out when check-in is chosen', async () => {
    renderForm({ districtId: '', checkIn: '2030-01-10', checkOut: '', guests: '' })
    await userEvent.click(screen.getByRole('button', { name: 'Знайти апартаменти' }))
    expect(screen.getByText('Оберіть дату виїзду')).toBeInTheDocument()
    expect(screen.queryByTestId('location')).not.toBeInTheDocument()
  })
})

describe('<RequireAuth>', () => {
  beforeEach(() => {
    auth.isLoading = false
    auth.isAuthenticated = true
    auth.roles = ['tenant']
    auth.login.mockClear()
  })

  const renderGuard = (roles?: ('tenant' | 'manager' | 'owner' | 'admin')[]) =>
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={<RequireAuth roles={roles}>secret content</RequireAuth>}
          />
          <Route path="/403" element={<p>forbidden page</p>} />
        </Routes>
      </MemoryRouter>,
    )

  it('anonymous user is sent to Keycloak login and sees nothing', () => {
    auth.isAuthenticated = false
    renderGuard()
    expect(auth.login).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('renders nothing while auth state is loading', () => {
    auth.isLoading = true
    auth.isAuthenticated = false
    renderGuard()
    expect(auth.login).not.toHaveBeenCalled()
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('user with a required role sees the page', () => {
    renderGuard(['tenant'])
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })

  it('user without the role is redirected to 403', () => {
    renderGuard(['manager'])
    expect(screen.getByText('forbidden page')).toBeInTheDocument()
  })

  it('admin passes every role check', () => {
    auth.roles = ['admin']
    renderGuard(['manager'])
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })
})
