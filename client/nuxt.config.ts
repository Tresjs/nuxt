import { resolve } from 'pathe'

export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxt/devtools-ui-kit',
    '@unocss/nuxt',
    '@nuxt/ui',
  ],
  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },
  },
  app: {
    baseURL: '/__tres_nuxt_devtools',
  },
})
