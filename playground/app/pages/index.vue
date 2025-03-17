<script setup lang="ts">
// for testing purposes with auto-import disabled
import { TresCanvas } from '@tresjs/core'
</script>

<template>
  <TresCanvas
    window-size
    render-mode="on-demand"
  >
    <TresPerspectiveCamera />
    <AnimatedDonnut color="orange" />
    <OrbitControls />
  </TresCanvas>
</template>
