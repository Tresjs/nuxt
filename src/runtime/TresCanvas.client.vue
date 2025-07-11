<script setup lang="ts">
import { TresCanvas as CoreTresCanvas } from '@tresjs/core'

const attrs = useAttrs()

console.log({ attrs })
</script>

<template>
  <CoreTresCanvas v-bind="attrs">
    <slot />
  </CoreTresCanvas>
</template>
