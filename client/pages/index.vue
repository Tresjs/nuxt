<script setup lang="ts">
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'

const client = useDevtoolsClient()
const tres = reactive({})
const scene = reactive({
  objects: 0,
  graph: {},
})

/* window.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'tresjs:devtools':
      tres.value = JSON.parse(event.data.payload)
      break
  
    default:
      break
  }
}) */

const icons: Record<string, string> = {
  scene: 'i-carbon-web-services-container',
  perspectivecamera: 'i-carbon-video',
  mesh: 'i-carbon-cube',
  group: 'i-carbon-group',
}

function createNode(object) {
  return {
    name: object.name,
    type: object.type,
    icon: icons[object.type.toLowerCase()] || 'i-carbon-cube',
    material: object.material ? object.material.type : 'None',
    geometry: object.geometry ? object.geometry.type : 'None',
    position: {
      x: object.position.x,
      y: object.position.y,
      z: object.position.z,
    },
    rotation: {
      x: object.rotation.x,
      y: object.rotation.y,
      z: object.rotation.z,
    },
    children: [],
  }
}

function getSceneGraph(scene) {
  
  function buildGraph(object, node) {
    object.children.forEach((child) => {
      const childNode = createNode(child)
      node.children.push(childNode)
      buildGraph(child, childNode)
    })
  }

  const root = createNode(scene)
  buildGraph(scene, root)

  return root
}

function countObjectsInScene(scene) {
  let count = 0

  scene.traverse((object) => {
    // Check if the object is a 3D object
    if (object.isObject3D) {
      count++
    }
  })

  return count
}

const tresGlobalHook = {
  cb(context) {
    Object.assign(tres, context)
    scene.objects = countObjectsInScene(context.scene.value)
    scene.graph = getSceneGraph(context.scene.value)
    console.log('tresGlobalHook', scene.graph )
  },
}

window.parent.parent.__TRES__DEVTOOLS__ = tresGlobalHook
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
        Nuxt DevTools is connected
      </NTip>
    </header>
 
    <div
      v-if="client"
      class="flex flex-col gap-2"
    >
      <NSectionBlock
        icon="i-carbon-web-services-container"
        text="Scene Graph"
        border="b base"
        :description="`Total Objects ${scene.objects}`"
      >
        <TreeItem :item="scene.graph" />
      </NSectionBlock>
      <NSectionBlock
        icon="i-iconoir-dashboard-speed"
        text="Performance"
      >
        Awiwi
      </NSectionBlock>
    </div>
    <div v-else>
      <NTip n="yellow">
        Failed to connect to the client. Did you open this page inside Nuxt DevTools?
      </NTip>
    </div>
  </div>
</template>
