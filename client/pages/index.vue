<script setup lang="ts">
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import { bytesToMB } from '../utils'
import { useDevtoolsHook } from '~/composables/useDevtoolsHook'

const client = useDevtoolsClient()

// Scene Graph
const { scene, memory, fps } = useDevtoolsHook()

const icons: Record<string, string> = {
  scene: 'i-carbon-web-services-container',
  perspectivecamera: 'i-carbon-video',
  mesh: 'i-carbon-cube',
  group: 'i-carbon-group',
  ambientlight: 'i-carbon-light',
  directionallight: 'i-carbon-light',
  spotlight: 'i-iconoir-project-curve-3d',
  position: 'i-iconoir-axes',
  rotation: 'i-carbon-rotate-clockwise',
  scale: 'i-iconoir-ellipse-3d-three-points',
}
</script>

<template>
  <div class="relative n-bg-base flex flex-col h-screen">
    <header
      class="p4 flex items-center justify-between hover:bg-active"
      border="b base"
    >
      <div class="flex items-center gap-4">
        <img
        
          src="/logo.svg"
          alt="tres logo"
        >
        <h2 class="text-xl opacity-60 font-bold">
          TresJS DevTools
        </h2>
      </div>  
      <NTip
        n="green"
        icon="carbon-checkmark"
      >
        connected
      </NTip>
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
        <TreeItem :item="scene.graph" />
      </NSectionBlock>
      <NSectionBlock
        icon="i-iconoir-dashboard-speed"
        text="Performance"
      >
        <template #actions>
          <NBadge n="green">
            FPS: {{ fps.value }}
          </NBadge>
          <NBadge
            n="yellow"
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
  </div>
</template>
