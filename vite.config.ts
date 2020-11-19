import { UserConfig } from 'vite'
import Voie from 'vite-plugin-voie'
import PurgeIcons from 'vite-plugin-purge-icons'
import ViteComponents from 'vite-plugin-components'
import PSVG from 'vite-plugin-psvg'

const config: UserConfig = {
  plugins: [
    Voie({
      importMode(path: string) {
        if (path === '/src/pages/index.vue')
          return 'sync'
        return 'async'
      },
    }),
    ViteComponents(),
    PurgeIcons(),
    PSVG(),
  ],
}

export default config
