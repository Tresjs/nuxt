<script setup lang="ts">
</script>

<template>
  <TresCanvas clear-color="#82DBC5">
    <TresPerspectiveCamera
      :position="[-5.3, 8.3, 10.6]"
      :look-at="[0, 1, 0]"
    />

    <NuxtStones />
    <OrbitControls />
  </TresCanvas>
</template>
