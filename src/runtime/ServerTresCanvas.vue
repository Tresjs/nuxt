<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const component = import.meta.client ? await import('@tresjs/core').then(({ TresCanvas }) => TresCanvas) : undefined
</script>

<template>
  <ClientOnly v-if="component">
    <component
      :is="component"
      v-bind="$attrs"
    >
      <slot />
    </component>
  </ClientOnly>
  <span
    v-else
    v-bind="$attrs"
  />
</template>