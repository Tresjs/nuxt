<script setup lang="ts">
import { computed, ref, onMounted, watch } from '#imports'
import { useDevtoolsHook } from '../composables/useDevtoolsHook'
import { generateGeometryPreview } from '../utils/assets'

const { scene, renderer } = useDevtoolsHook()

// Store geometry previews
const geometryPreviews = ref<Record<string, string>>({})

// Group assets by type
const groupedAssets = computed(() => {
  const assets = scene.assets || []
  return {
    textures: assets.filter(asset => asset.type === 'texture'),
    geometries: assets.filter(asset => asset.type === 'geometry'),
    materials: assets.filter(asset => asset.type === 'material'),
  }
})

// Asset statistics
const assetStats = computed(() => {
  const assets = scene.assets || []
  const totalMemory = assets.reduce((sum, asset) => sum + (asset.usage || 0), 0)

  return {
    total: assets.length,
    textures: groupedAssets.value.textures.length,
    geometries: groupedAssets.value.geometries.length,
    materials: groupedAssets.value.materials.length,
    totalMemory: Math.round(totalMemory),
  }
})

// Get icon for asset type
const getAssetIcon = (type: string) => {
  switch (type) {
    case 'texture':
      return 'i-tabler:photo'
    case 'geometry':
      return 'i-tabler:box'
    case 'material':
      return 'i-tabler:palette'
    default:
      return 'i-tabler:file'
  }
}

// Get color for asset type
const getAssetColor = (type: string) => {
  switch (type) {
    case 'texture':
      return 'purple'
    case 'geometry':
      return 'blue'
    case 'material':
      return 'orange'
    default:
      return 'gray'
  }
}

// Format memory size
const formatMemorySize = (kb: number) => {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

// Generate geometry previews when assets change
const generateGeometryPreviews = async () => {
  if (!groupedAssets.value.geometries.length) return

  for (const asset of groupedAssets.value.geometries) {
    if (asset.object && !geometryPreviews.value[asset.id]) {
      try {
        // For now, skip geometry screenshots as they require WebGL renderer access
        // This could be implemented later with proper renderer access
        geometryPreviews.value[asset.id] = ''
        console.log('Geometry preview generation temporarily disabled for:', asset.name)
      }
      catch (error) {
        console.warn('Failed to generate preview for geometry:', asset.name, error)
      }
    }
  }
}

// Watch for asset changes and generate previews
watch(() => scene.assets, generateGeometryPreviews, { deep: true })

onMounted(() => {
  generateGeometryPreviews()
})
</script>

<template>
  <div class="pb-6">
    <!-- Assets Overview Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
      <UCard>
        <div class="text-center">
          <div class="font-bold text-gray-900 dark:text-white">
            {{ assetStats.total }}
          </div>
          <div class="text-sm">
            Total Assets
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <UIcon
              name="i-tabler:photo"
              class="w-5 h-5"
            />
            <div class="font-bold ">
              {{ assetStats.textures }}
            </div>
          </div>
          <div class="text-sm">
            Textures
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <UIcon
              name="i-tabler:box"
              class="w-5 h-5 text-blue-500"
            />
            <div class="font-bold text-blue-600">
              {{ assetStats.geometries }}
            </div>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Geometries
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <UIcon
              name="i-tabler:database"
              class="w-5 h-5 text-green-500"
            />
            <div class="font-bold text-green-600">
              {{ formatMemorySize(assetStats.totalMemory) }}
            </div>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Memory Used
          </div>
        </div>
      </UCard>
    </div>

    <!-- Assets Grid -->
    <div v-if="scene.assets && scene.assets.length > 0">
      <!-- Textures -->
      <div
        v-if="groupedAssets.textures.length > 0"
        class="pb-4"
      >
        <div class="flex items-center gap-2 my-2 mb-4">
          <UIcon
            name="i-tabler:photo"
            class="w-5 h-5"
          />
          <h3 class="font-semibold">
            Textures
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <UCard
            v-for="asset in groupedAssets.textures"
            :key="asset.id"
            class="hover:shadow-md transition-shadow"
          >
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  :name="getAssetIcon(asset.type)"
                  class="w-4 h-4"
                  :class="`text-${getAssetColor(asset.type)}-500`"
                />
                <div class="text-sm font-medium truncate">
                  {{ asset.source }}
                </div>
              </div>
            </template>

            <div class="pb-3">
              <!-- Texture Preview -->
              <div
                v-if="asset.preview"
                class="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
              >
                <img
                  :src="asset.preview"
                  :alt="asset.name"
                  class="w-full h-full object-contain"
                  @error="$event.target.style.display = 'none'"
                >
              </div>

              <!-- Fallback for textures without preview -->
              <div
                v-else
                class="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-tabler:photo-off"
                  class="w-8 h-8 text-gray-400"
                />
              </div>

              <div class="flex flex-col gap-1 py-2 text-sm">
                <div
                  v-if="asset.dimensions"
                  class="flex justify-between"
                >
                  <span class="text-gray-600 dark:text-gray-400 font-semibold">Size</span>
                  <span class="font-mono">{{ asset.dimensions }} <UBadge
                    v-if="asset.resolution"
                    variant="soft"
                    color="primary"
                  >{{ asset.resolution }}</UBadge></span>
                </div>

                <div
                  v-if="asset.format"
                  class="flex justify-between"
                >
                  <span class="text-gray-600 dark:text-gray-400 font-semibold">Format</span>
                  <span>{{ asset.format }}</span>
                </div>

                <div
                  v-if="asset.usage"
                  class="flex justify-between"
                >
                  <span class="text-gray-600 dark:text-gray-400 font-semibold">Memory</span>
                  <span class="font-mono">{{ formatMemorySize(asset.usage) }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Geometries -->
      <div
        v-if="groupedAssets.geometries.length > 0"
        class="pb-4"
      >
        <div class="flex items-center gap-2  my-2 mb-4">
          <UIcon
            name="i-tabler:box"
            class="w-5 h-5"
          />
          <h3 class="text-lg font-semibold">
            Geometries
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <UCard
            v-for="asset in groupedAssets.geometries"
            :key="asset.id"
            class="hover:shadow-md transition-shadow"
          >
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  :name="getAssetIcon(asset.type)"
                  class="w-4 h-4"
                  :class="`text-${getAssetColor(asset.type)}-500`"
                />
                <div class="text-sm font-medium truncate">
                  {{ asset.name }}
                </div>
              </div>
            </template>

            <div class="pb-3">
              <!-- Geometry Preview -->
              <div
                v-if="geometryPreviews[asset.id]"
                class="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
              >
                <img
                  :src="geometryPreviews[asset.id]"
                  :alt="asset.name"
                  class="w-full h-full object-contain"
                >
              </div>

              <!-- Placeholder for geometry preview -->
              <div
                v-else
                class="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
              >
                <div class="flex flex-col items-center gap-2">
                  <UIcon
                    name="i-tabler:box"
                    class="w-8 h-8 text-gray-400"
                  />
                  <span class="text-xs text-gray-500">
                    3D Model
                  </span>
                </div>
              </div>

              <div class="pb-2 text-sm">
                <div
                  v-if="asset.size"
                  class="flex justify-between"
                >
                  <span class="text-gray-600 dark:text-gray-400">Attributes:</span>
                  <span>{{ asset.size }}</span>
                </div>

                <div
                  v-if="asset.usage"
                  class="flex justify-between"
                >
                  <span class="text-gray-600 dark:text-gray-400">Memory:</span>
                  <span class="font-mono">{{ formatMemorySize(asset.usage) }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Materials -->
      <div
        v-if="groupedAssets.materials.length > 0"
        class="pb-4"
      >
        <div class="flex items-center gap-2 my-2 mb-4">
          <UIcon
            name="i-tabler:palette"
            class="w-5 h-5"
          />
          <h3 class="text-lg font-semibold">
            Materials
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <UCard
            v-for="asset in groupedAssets.materials"
            :key="asset.id"
            class="hover:shadow-md transition-shadow"
          >
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  :name="getAssetIcon(asset.type)"
                  class="w-4 h-4"
                  :class="`text-${getAssetColor(asset.type)}-500`"
                />
                <div class="text-sm font-medium truncate">
                  {{ asset.name }}
                </div>
              </div>
            </template>

            <div class="pb-2 text-sm">
              <div
                v-if="asset.format"
                class="flex justify-between"
              >
                <span class="text-gray-600 dark:text-gray-400">Type:</span>
                <span>{{ asset.format }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <UCard v-else>
      <div class="text-center py-8">
        <UIcon
          name="i-tabler:file-x"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Assets Found
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          No textures, geometries, or materials detected in the current scene.
        </p>
      </div>
    </UCard>
  </div>
</template>
