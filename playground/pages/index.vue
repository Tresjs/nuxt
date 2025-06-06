<script setup lang="ts">
// for testing purposes with auto-import disabled
// import { TresCanvas } from '#components'

const handlePointerEnter = (e) => {
  console.log('enter', e)
}

const handlePointerLeave = (e) => {
  console.log('leave', e)
}
</script>

<template>
  <TresCanvas
    window-size
  >
    <TresPerspectiveCamera />
    <AnimatedDonnut
      color="orange"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
    />
    <OrbitControls />
  </TresCanvas>
</template>
