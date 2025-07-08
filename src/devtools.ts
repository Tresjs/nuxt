import { existsSync } from 'node:fs'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'

const DEVTOOLS_UI_ROUTE = '/__tres_nuxt_devtools'
const DEVTOOLS_UI_LOCAL_PORT = 3300

export function setupDevToolsUI(nuxt: Nuxt, resolver: Resolver) {
  const clientPath = resolver.resolve('./client')
  const isProductionBuild = existsSync(clientPath)

  // Serve production-built client (used when package is published)
  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r)
      server.middlewares.use(
        DEVTOOLS_UI_ROUTE,
        sirv(clientPath, { dev: true, single: true }),
      )
    })
  }
  // In local development, use Nitro to proxy to the separate Nuxt Server
  else {
    // Use Nitro hooks instead of vite:extendConfig for better compatibility with Nuxt 4
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.routeRules = nitroConfig.routeRules || {}
      // Add a route rule to proxy the devtools route to the local development server
      nitroConfig.routeRules[`${DEVTOOLS_UI_ROUTE}/**`] = {
        proxy: `http://localhost:${DEVTOOLS_UI_LOCAL_PORT}${DEVTOOLS_UI_ROUTE}/**`,
      }
    })
  }

  nuxt.hook('devtools:customTabs', (tabs) => {
    tabs.push({
      // unique identifier
      name: 'tres-nuxt-devtools',
      // title to display in the tab
      title: 'TresJS',
      // any icon from Iconify, or a URL to an image
      icon: 'https://raw.githubusercontent.com/Tresjs/tres/main/public/favicon.svg',
      // iframe view
      view: {
        type: 'iframe',
        src: DEVTOOLS_UI_ROUTE,
      },
    })
  })
}
