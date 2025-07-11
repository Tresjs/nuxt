import { readFile } from 'node:fs/promises'
import { addComponent, addImports, addVitePlugin, createResolver, defineNuxtModule, resolvePath } from '@nuxt/kit'
import * as core from '@tresjs/core'
import { templateCompilerOptions } from '@tresjs/core'
import { defu } from 'defu'
import { findExportNames } from 'mlly'
import { readPackageJSON } from 'pkg-types'
import glsl from 'vite-plugin-glsl'
import { version } from '../package.json'
import { setupDevToolsUI } from './devtools'

export interface ModuleOptions {
  modules: string[]
  devtools: boolean
  glsl: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@tresjs/nuxt',
    configKey: 'tres',
    compatibility: {
      nuxt: '>=3.16.0',
    },
    version,
  },
  defaults: {
    modules: [],
    devtools: true,
    glsl: false,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.build.transpile.push(/@tresjs/)

    for (const name in core) {
      if (name.match(/^use/)) {
        addImports({
          from: '@tresjs/core',
          name,
        })
      }
    }
    addImports([
      {
        from: '@tresjs/core',
        name: 'extend',
        as: 'extendTres',
      },
      {
        from: '@tresjs/core',
        type: true,
        name: 'TresObject',
      },
    ])

    const pkg = await readPackageJSON(nuxt.options.rootDir)
    const coreDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter(d => d.startsWith('@tresjs/'))

    const mods = new Set([...options.modules, ...coreDeps])
    // @tresjs/post-processing doesn't have default subpackage export,
    // we need to import submodules manually here.
    // The resolvePath call will not be able to resolve the entry file and will fail
    // when reading the content to get the exports.
    if (mods.has('@tresjs/post-processing')) {
      mods.delete('@tresjs/post-processing')
      mods.add('@tresjs/post-processing/three')
      mods.add('@tresjs/post-processing/pmndrs')
    }

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ types: '@tresjs/core' })
      if (mods.has('@tresjs/post-processing/three')) {
        references.push({ types: '@tresjs/post-processing/three' })
      }
      if (mods.has('@tresjs/post-processing/pmndrs')) {
        references.push({ types: '@tresjs/post-processing/pmndrs' })
      }
    })

    nuxt.options.vue.compilerOptions.isCustomElement = templateCompilerOptions.template.compilerOptions.isCustomElement

    nuxt.options.vite.resolve = defu(nuxt.options.vite.resolve, {
      dedupe: ['three'],
    })

    nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, {
      include: ['three'],
    })

    const promises: Promise<void>[] = [
      addComponent({
        name: 'TresCanvas',
        filePath: resolver.resolve('./runtime/TresCanvas.client.vue'),
      }),
      addComponent({
        name: 'TresCanvas',
        filePath: resolver.resolve('./runtime/TresCanvas.server.vue'),
      }),
    ]

    for (const mod of new Set([...options.modules, ...coreDeps])) {
      if (mod === '@tresjs/core' || mod === '@tresjs/nuxt') {
        continue
      }

      const entry = await resolvePath(mod)
      if (entry === mod) {
        continue
      }

      const imports = findExportNames(await readFile(entry, 'utf8'))

      for (const name of imports) {
        if (name.match(/^[a-z]/)) {
          addImports({
            from: mod,
            name,
          })
        }
        else {
          promises.push(addComponent({
            name,
            filePath: mod,
            export: name,
          }))
        }
      }
    }

    await Promise.all(promises)

    if (options.devtools) {
      setupDevToolsUI(nuxt, resolver)
    }

    if (options.glsl) {
      addVitePlugin(glsl())
    }
  },
})
