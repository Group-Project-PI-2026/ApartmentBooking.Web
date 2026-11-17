import { expect, test } from './fixtures'

test.describe('Адаптивність (mobile)', () => {
  test('FE-E2E-12 на мобільному немає горизонтального скролу, картки в одну колонку', async ({
    page,
  }) => {
    await page.goto('/apartments')
    await expect(page.locator('article').first()).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)

    const boxes = await page
      .locator('article')
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().left))
    expect(new Set(boxes.map(Math.round)).size).toBe(1)
  })

  test('FE-E2E-13 головна сторінка на мобільному показує форму пошуку', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Знайти апартаменти' }).first()).toBeVisible()
  })
})
