<!-- eslint-disable max-len -->
<script setup lang="ts">
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import type { TabsItem } from '@nuxt/ui'

// import { useDevtoolsHook } from '../composables/useDevtoolsHook'

// const client = useDevtoolsClient()

// Scene Graph
/* const { scene, memory, fps } = useDevtoolsHook() */
const client = useDevtoolsClient()

const { scene, memory, fps } = useDevtoolsHook()

const tabs = [
  {
    label: 'Scene Graph',
    description: 'Make changes to your account here. Click save when you\'re done.',
    icon: 'i-lucide-film',
    slot: 'scene-graph' as const,
  },
  {
    label: 'Performance',
    description: 'Change your password here. After saving, you\'ll be logged out.',
    icon: 'i-lucide-chart-line',
    slot: 'performance' as const,
  },
] satisfies TabsItem[]
</script>

<template>
  <div
    class="pattern-bg "
  >
    <TheHeader />

    <main class="bg-(--ui-bg) p-8 min-h-[calc(100vh-var(--ui-header-height))] max-w-screen-xl mx-auto pt-2 bg-default">
      <UTabs
        :items="tabs"
        color="primary"
        size="lg"
        variant="link"
        :ui="{ trigger: 'grow' }"
        class="gap-4 w-full"
      >
        <template #scene-graph>
          <SceneGraph />
        </template>
        <template #performance>
          <PerformanceMonitor />
        </template>
      </UTabs>
    </main>
  </div>
</template>
