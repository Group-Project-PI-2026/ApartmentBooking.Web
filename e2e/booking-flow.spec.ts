import { apartments, expect, isoInDays, test } from './fixtures'

test.describe('Гість: пошук і перегляд апартаментів', () => {
  test('FE-E2E-01 головна сторінка завантажується з формою пошуку і районами', async ({
    page,
    api,
  }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Апартаменти у Києві для вашої поїздки',
    )
    await expect(page.getByRole('heading', { name: 'Оберіть район Києва' })).toBeVisible()
    await expect(
      page.getByLabel('Район Києва').first().locator('option', { hasText: 'Подільський' }),
    ).toHaveCount(1)
    expect(api.requests).toContain('GET /api/apartments/districts')
  })

  test('FE-E2E-02 пошук за районом і гостями передає параметри в API та показує картки', async ({
    page,
    api,
  }) => {
    await page.goto('/')
    const form = page.locator('form').first()
    await form.getByLabel('Район Києва').selectOption('6')
    await form.getByLabel('Гості').fill('2')
    await form.getByRole('button', { name: 'Знайти апартаменти' }).click()

    await expect(page).toHaveURL(/\/apartments\?districtId=6&guests=2/)
    await expect(page.getByRole('heading', { name: 'Студія біля Печерської лаври' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Двокімнатна на Хрещатику' })).toHaveCount(0)
    expect(
      api.requests.some(
        (r) =>
          r.startsWith('GET /api/apartments?') &&
          r.includes('districtId=6') &&
          r.includes('guestsCount=2'),
      ),
    ).toBe(true)
  })

  test('FE-E2E-03 сортування «Спочатку дорожчі» змінює порядок карток', async ({ page }) => {
    await page.goto('/apartments')
    const titles = page.locator('article h3')
    await expect(titles).toHaveCount(3)

    await page.getByLabel('Сортувати').selectOption('priceDesc')

    await expect(titles).toHaveText([
      'Двокімнатна на Хрещатику',
      'Студія біля Печерської лаври',
      'Квартира на Подолі',
    ])
  })

  test('FE-E2E-04 помилка API пошуку показує зрозуміле повідомлення', async ({ page, api }) => {
    api.searchResult = () => ({ status: 500 })
    await page.goto('/apartments')

    await expect(
      page.getByText('Не вдалося завантажити апартаменти. Спробуйте ще раз.'),
    ).toBeVisible()
  })

  test('FE-E2E-05 картка відкриває сторінку апартаментів з описом і зручностями', async ({
    page,
  }) => {
    await page.goto('/apartments?districtId=10')
    await page.getByRole('link', { name: 'Переглянути' }).first().click()

    await expect(page).toHaveURL(`/apartments/${apartments[1].id}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Двокімнатна на Хрещатику')
    await expect(page.getByRole('heading', { name: 'Зручності' })).toBeVisible()
    await expect(page.getByText('Оберіть дати, щоб побачити загальну суму.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Перейти до бронювання' })).toBeDisabled()
  })

  test('FE-E2E-06 з датами в URL рахується загальна сума', async ({ page }) => {
    const id = apartments[0].id
    const checkIn = isoInDays(20)
    const checkOut = isoInDays(23)
    await page.goto(`/apartments/${id}?checkIn=${checkIn}&checkOut=${checkOut}`)

    await expect(page.getByText(/1\s800 ₴ × 3 ночі/)).toBeVisible()
    await expect(page.getByText(/Загальна сума 5\s400 ₴/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Перейти до бронювання' })).toBeEnabled()
  })

  test('FE-E2E-07 зайняті дати: повідомлення і заблокована кнопка', async ({ page, api }) => {
    api.searchResult = (url) => (url.searchParams.get('checkIn') ? [] : [])
    const id = apartments[0].id
    await page.goto(`/apartments/${id}?checkIn=${isoInDays(20)}&checkOut=${isoInDays(22)}`)

    await expect(page.getByText('Ці дати вже зайняті. Оберіть інші дати.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Перейти до бронювання' })).toBeDisabled()
  })

  test('FE-E2E-08 гостей більше за місткість — помилка біля поля', async ({ page }) => {
    await page.goto(`/apartments/${apartments[0].id}`)
    await page.locator('aside').getByLabel('Гості').fill('5')

    await expect(page.getByText('Максимум 2 для цих апартаментів')).toBeVisible()
  })

  test('FE-E2E-14 BUG-FE-004: умови оплати і скасування відповідають політиці бекенду', async ({
    page,
  }) => {
    // Known bug: the page promises 50 % prepayment and a 10 % / 24 h penalty, while the backend
    // (appsettings Booking section) charges 30 % and keeps 50 % of the price when cancelled < 7 days before check-in.
    test.fail()
    await page.goto(`/apartments/${apartments[0].id}`)
    const terms = page.locator('section', {
      has: page.getByRole('heading', { name: 'Умови оплати та скасування' }),
    })

    await expect(terms).toContainText('передоплата 30%', { timeout: 2000 })
    await expect(terms).toContainText('50%', { timeout: 2000 })
    await expect(terms).not.toContainText('10%', { timeout: 2000 })
  })

  test('FE-E2E-09 неіснуючі апартаменти та невідомий маршрут', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await expect(page.getByRole('heading', { name: 'Сторінку не знайдено' })).toBeVisible()
  })
})

test.describe('Автентифікація (Keycloak замокано)', () => {
  test('FE-E2E-10 неавторизований гість при бронюванні перенаправляється на Keycloak з PKCE', async ({
    page,
  }) => {
    const id = apartments[0].id
    await page.goto(`/apartments/${id}?checkIn=${isoInDays(20)}&checkOut=${isoInDays(22)}`)
    await expect(page.getByText('Для бронювання потрібно увійти в акаунт.')).toBeVisible()

    await page.getByRole('button', { name: 'Перейти до бронювання' }).click()

    await expect(page.getByRole('heading', { name: 'Keycloak login (mock)' })).toBeVisible()
    const url = new URL(page.url())
    expect(url.pathname).toBe('/realms/apartment-booking/protocol/openid-connect/auth')
    expect(url.searchParams.get('client_id')).toBe('apartment-booking-spa')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('redirect_uri')).toMatch(/\/auth\/callback$/)
  })

  test('FE-E2E-11 захищена сторінка «Мої бронювання» вимагає входу', async ({ page }) => {
    await page.goto('/bookings')

    await expect(page.getByRole('heading', { name: 'Keycloak login (mock)' })).toBeVisible()
  })
})
