import { fileURLToPath } from 'node:url'
import { $fetch, createPage, setup, url } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { version } from '@tresjs/core/package.json'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
    browser: true,
  })

  it('renders a client-only component', async () => {
    const html = await $fetch('/')
    expect(html).toContain(`data-tres="tresjs ${version}"`)
  })

  it('has no errors on the client', async () => {
    const page = await createPage()
    const logs: string[] = []
    page.on('console', ({ text, type }) => {
      if (type() === 'error') {
        logs.push(text())
      }
    })
    await page.goto(url('/'))
    expect(logs.length).toBe(0)
  })
})
