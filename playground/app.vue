<script setup lang="ts">
import { BasicShadowMap, NoToneMapping, SRGBColorSpace } from 'three'

const gl = reactive({
  clearColor: '#18181B',
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
})

const showScene = ref(false)

setTimeout(() => {
  showScene.value = true
}, 500)
</script>

<template>
  <div style="height: 100vh">
    <TresCanvas v-bind="gl">
      <CtxExposer />
      <TresPerspectiveCamera
        :position="[-5.3, 8.3, 10.6]"
        :look-at="[0, 0, 0]"
      />
      <OrbitControls />

      <Suspense>
        <NuxtStones />
      </Suspense>
    </TresCanvas>
  </div>
</template>

<style>
html,
body {
  background: "#18181B";
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
