import { chromium } from 'playwright'

async function run(no: string, take = 3) {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: {
      width: 800,
      height: 500,
    },
    deviceScaleFactor: 2,
  })
  for (let i = 0; i < take; i++) {
    const page = await context.newPage()
    await page.goto(`http://100.antfu.me/${no}?shot=true`)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `scripts/screenshots/${no}-${i}.png` })
  }
  await browser.close()
}

run('001')
