<script setup lang="ts">
import { TresCanvas as CoreTresCanvas } from '@tresjs/core'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <CoreTresCanvas v-bind="$attrs">
    <slot />
  </CoreTresCanvas>
</template>
