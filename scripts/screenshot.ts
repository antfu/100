import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: {
      width: 960,
      height: 500,
    },
    deviceScaleFactor: 2,
  })

  async function take(no: string, retry = 3, delay = 1000, take = 1, query = '') {
    for (let i = 0; i < retry; i++) {
      const page = await context.newPage()
      await page.goto(`http://localhost:3333/${no}?shot=true${query}`)
      await page.waitForTimeout(delay)
      for (let j = 0; j < take; j++)
        await page.screenshot({ path: `scripts/screenshots/${no}-${i}-${j}.png` })

      page.close()
    }
  }

  // await take('', 1)
  // await take('001', 3, 800, 4)
  // await take('002', 8, 500)
  // await take('003', 1, 1500, 5)
  // await take('004', 1, 500)
  // await take('005', 5, 1000, 20, '&q=th%20-%20sin(r)%20*%20cos(t)')
  // await take('006', 4, 3000, 5, '&shake=true')
  // await take('007', 1, 500)
  // await take('008', 1, 500, 8)
  // await take('009', 10, 1500)
  // await take('010', 1, 500)
  await take('011', 10, 500)

  await browser.close()
}

run()
