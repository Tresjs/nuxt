export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/devtools'],
  ssr: true,

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2025-03-14',

  // for testing purposes: include some nuxt build tests
  nitro: {
    routeRules: {
      '/page1': { ssr: false }, // <== client rendered page
      '/page2': { prerender: true }, // <== server SSG page + payload
    },
  },

  // for testing purposes
  // imports: {
  //   autoImport: false,
  // },
  tres: {
    // for testing purposes, and so we test both deduplication + auto-detection capabilities
    // modules: ['@tresjs/cientos'],
    devtools: true,
    glsl: true,
  },
})
