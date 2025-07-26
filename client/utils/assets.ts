import type { Scene, Texture, Material, BufferGeometry, WebGLRenderer, PerspectiveCamera, Mesh } from 'three'
import { Vector3, Box3, MeshBasicMaterial, Color, Scene as ThreeScene, PerspectiveCamera as ThreePerspectiveCamera, DirectionalLight, AmbientLight, Mesh as ThreeMesh } from 'three'

export interface AssetInfo {
  id: string
  name: string
  type: 'texture' | 'geometry' | 'material'
  size?: string
  dimensions?: string
  format?: string
  usage?: number
  source?: string
  preview?: string // Base64 or URL for preview
  object?: any // Reference to the original Three.js object
}

/**
 * Extracts all textures from the scene
 */
export function extractTextures(scene: Scene): AssetInfo[] {
  const textures = new Map<string, Texture>()

  scene.traverse((object) => {
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material]

      materials.forEach((material: Material) => {
        // Check all possible texture properties
        const textureProperties = [
          'map', 'normalMap', 'bumpMap', 'displacementMap',
          'roughnessMap', 'metalnessMap', 'alphaMap', 'envMap',
          'emissiveMap', 'specularMap', 'aoMap', 'lightMap',
        ]

        textureProperties.forEach((prop) => {
          const texture = (material as any)[prop] as Texture
          if (texture && texture.isTexture) {
            textures.set(texture.uuid, texture)
          }
        })
      })
    }
  })

  return Array.from(textures.values()).map((texture): AssetInfo => {
    const image = texture.image
    const size = image ? `${image.width}x${image.height}` : 'Unknown'

    return {
      id: texture.uuid,
      name: texture.name || 'Unnamed Texture',
      type: 'texture',
      dimensions: size,
      resolution: `${Math.round(image.width / 1024)}k`,
      format: getTextureFormat(texture),
      source: getTextureSource(texture),
      usage: getTextureMemoryUsage(texture),
      preview: getTexturePreview(texture),
      object: texture,
    }
  })
}

/**
 * Extracts all materials from the scene
 */
export function extractMaterials(scene: Scene): AssetInfo[] {
  const materials = new Map<string, Material>()

  scene.traverse((object) => {
    if (object.material) {
      const mats = Array.isArray(object.material) ? object.material : [object.material]
      mats.forEach((material: Material) => {
        materials.set(material.uuid, material)
      })
    }
  })

  return Array.from(materials.values()).map((material): AssetInfo => ({
    id: material.uuid,
    name: material.name || material.type || 'Unnamed Material',
    type: 'material',
    format: material.type,
    usage: 1, // Materials are lightweight
  }))
}

/**
 * Gets all assets from the scene
 */
export function extractAllAssets(scene: Scene): AssetInfo[] {
  return [
    ...extractTextures(scene),
    ...extractMaterials(scene),
  ]
}

// Helper functions
function getTextureFormat(texture: Texture): string {
  const formatMap: Record<number, string> = {
    1023: 'RGB',
    1024: 'RGBA',
    1025: 'Alpha',
    1026: 'Luminance',
    1027: 'LuminanceAlpha',
  }
  return formatMap[texture.format] || 'Unknown'
}

function getTextureSource(texture: Texture): string {
  if (texture.image) {
    if (texture.image.src) return texture.image.src.split('/').pop() || 'Unknown'
    if (texture.image.currentSrc) return texture.image.currentSrc.split('/').pop() || 'Unknown'
  }
  return 'Generated'
}

function getTextureMemoryUsage(texture: Texture): number {
  if (!texture.image) return 0

  const width = texture.image.width || 0
  const height = texture.image.height || 0

  // Estimate bytes per pixel based on format
  let bytesPerPixel = 4 // RGBA default
  if (texture.format === 1023) bytesPerPixel = 3 // RGB
  if (texture.format === 1025) bytesPerPixel = 1 // Alpha

  return Math.round((width * height * bytesPerPixel) / 1024) // KB
}

/**
 * Generate a preview image for a texture
 */
function getTexturePreview(texture: Texture): string | undefined {
  try {
    if (texture.image) {
      // For HTMLImageElement, HTMLCanvasElement, or ImageBitmap
      if (texture.image.src) {
        return texture.image.src
      }

      // For canvas or other image types, convert to data URL
      if (texture.image instanceof HTMLCanvasElement) {
        return texture.image.toDataURL()
      }

      // For other image elements, try to get currentSrc
      if (texture.image.currentSrc) {
        return texture.image.currentSrc
      }
    }
  }
  catch (error) {
    console.warn('Failed to get texture preview:', error)
  }
  return undefined
}

/**
 * Generate a screenshot preview for a geometry
 */
export function generateGeometryPreview(geometry: BufferGeometry, renderer?: WebGLRenderer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (!renderer) {
        resolve('')
        return
      }

      // Create a temporary scene and camera for rendering
      const tempScene = new ThreeScene()
      const camera = new ThreePerspectiveCamera(75, 1, 0.1, 1000)

      // Add lighting
      const ambientLight = new AmbientLight(0x404040, 0.6)
      const directionalLight = new DirectionalLight(0xFFFFFF, 0.8)
      directionalLight.position.set(10, 10, 5)
      tempScene.add(ambientLight)
      tempScene.add(directionalLight)

      // Create a mesh with the geometry
      const material = new MeshBasicMaterial({
        color: new Color(0x00FF00),
        wireframe: false,
      })
      const mesh = new ThreeMesh(geometry, material)
      tempScene.add(mesh)

      // Calculate bounding box and position camera
      const box = new Box3().setFromGeometry(geometry)
      const size = box.getSize(new Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)

      // Position camera to frame the geometry
      camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5)
      camera.lookAt(box.getCenter(new Vector3()))

      // Store original renderer size
      const originalSize = renderer.getSize(new Vector3())

      // Set small render size for thumbnail
      const thumbnailSize = 128
      renderer.setSize(thumbnailSize, thumbnailSize)

      // Render the scene
      renderer.render(tempScene, camera)

      // Get the canvas data URL
      const canvas = renderer.domElement
      const dataURL = canvas.toDataURL('image/png')

      // Restore original renderer size
      renderer.setSize(originalSize.x, originalSize.y)

      resolve(dataURL)
    }
    catch (error) {
      console.warn('Failed to generate geometry preview:', error)
      resolve('')
    }
  })
}
