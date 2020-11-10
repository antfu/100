import fs from 'fs-extra'
import cheerio from 'cheerio'
import { works } from '../src/works'

const DOMAIN = 'https://100.antfu.me'

export async function postBuild() {
  console.log('post build!')

  const indexHTML = await fs.readFile('dist/index.html', 'utf-8')

  for (const work of works) {
    const $ = cheerio.load(indexHTML)

    const head = $('head')
    const title = `${work.no}. ${work.name}`
    $('title').text(title)

    head.append($(`<meta property="og:title" content="${title}" />`))

    if (fs.existsSync(`public/shots/${work.no}.png`)) {
      head.append($(`<meta property="og:image" content="${DOMAIN}/shots/${work.no}.png" />`))
      head.append($('<meta name="twitter:card" content="summary_large_image" />'))
    }
    head.append($('<meta name="twitter:creator" content="@antfu7" />'))

    await fs.writeFile(`dist/${work.no}.html`, $.html(), 'utf-8')
  }
}

postBuild()
