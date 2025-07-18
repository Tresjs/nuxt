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
          <!-- <SceneGraphItem :item="scene.graph" /> -->
        </template>
        <template #performance>
          <!-- <PerformanceMonitor /> -->
        </template>
      </UTabs>
    </main>
  </div>
  <!-- <div class="relative n-bg-base flex flex-col h-screen">
    <header
      class="p4 flex items-center justify-between hover:bg-active"
      border="b base"
    >
      <div class="flex items-center gap-4">
        <img

          src="/logo.svg"
          alt="tres logo"
        >
        <h2 class="opacity-60 font-bold">
          TresJS DevTools
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          color="white"
          size="sm"
          icon="i-carbon-document"
          target="_blank"
          to="https://docs.tresjs.org/"
        />
        <UButton
          variant="ghost"
          color="white"
          size="sm"
          icon="i-iconoir-github"
          target="_blank"
          to="https://github.com/Tresjs/nuxt"
        />
      </div>
    </header>

    <div
      v-if="client && scene.objects > 0"
      class="flex flex-col gap-2"
    >
      <NSectionBlock
        icon="i-iconoir-movie"
        text="Scene Graph"
        :description="`Total Objects ${scene.objects}`"
      >
        <SceneGraphItem :item="scene.graph" />
      </NSectionBlock>
      <NSectionBlock
        icon="i-iconoir-dashboard-speed"
        text="Performance"
      >
        <template #actions>
          <NBadge
            n="green"
            class="text-[#15803D] dark:text-[#34E676]"
          >
            FPS: {{ fps.value }}
          </NBadge>
          <NBadge
            n="yellow"
            class="text-[#827717] dark:text-[#EAB306]"
          >
            Memory: {{ Math.round(memory?.currentMem) }}MB
          </NBadge>
        </template>
        <template #default>
          <PerformanceMonitor />
        </template>
      </NSectionBlock>
    </div>
    <div v-else-if="scene.objects === 0">
      <div class="p4 h-full">
        <NLoading />
      </div>
    </div>
    <div v-else>
      <NTip n="yellow">
        Failed to connect to the client. Did you open this page inside Nuxt DevTools?
      </NTip>
    </div>
  </div> -->
</template>
