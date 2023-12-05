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
  ambientlight: 'i-carbon-light',
  directionallight: 'i-carbon-light',
  spotlight: 'i-iconoir-project-curve-3d',
  position: 'i-iconoir-axes',
  rotation: 'i-carbon-rotate-clockwise',
  scale: 'i-iconoir-ellipse-3d-three-points',
}

function createNode(object) {
  const node = {
    name: object.name,
    type: object.type,
    icon: icons[object.type.toLowerCase()] || 'i-carbon-cube',
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

  if (object.type === 'Mesh') {
    node.material = object.material
    node.geometry = object.geometry
    node.scale = {
      x: object.scale.x,
      y: object.scale.y,
      z: object.scale.z,
    }
  }

  if (object.type.includes('Light')) {
    node.color = object.color.getHexString()
    node.intensity = object.intensity
  }
  return node
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
        Awiwi
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
