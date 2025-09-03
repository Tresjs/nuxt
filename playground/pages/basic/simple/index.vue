<script setup lang="ts">
const { clearColor } = useControls({
  clearColor: '#82DBC5',
}, {
  uuid: 'simple',
})
</script>

<template>
  <div class="w-full h-screen relative">
    <ClientOnly>
      <TresLeches uuid="simple" />
    </ClientOnly>
    <TresCanvas
      :clear-color="clearColor"
    >
      <TresPerspectiveCamera />
      <TresGroup>
        <TresMesh>
          <TresBoxGeometry />
          <TresMeshNormalMaterial />
        </TresMesh>
        <TresMesh
          position-x="1"
        >
          <TresSphereGeometry />
          <TresMeshBasicMaterial
            color="cyan"
          />
        </TresMesh>
      </TresGroup>
      <OrbitControls />
    </TresCanvas>
  </div>
</template>
