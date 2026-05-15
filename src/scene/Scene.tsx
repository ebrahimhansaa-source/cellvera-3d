import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  OrbitControls,
  SpotLight,
  AdaptiveDpr,
  AdaptiveEvents,
} from '@react-three/drei'
import * as THREE from 'three'
import { Vial, VIAL_TOTAL_HEIGHT } from './Vial'
import { Box } from './Box'
import { makeMarbleTexture } from './labels'

export type Mode = 'realistic' | 'stylized'
export type Product = 'single' | 'duo'

function MarbleFloor({ mode }: { mode: Mode }) {
  const marble = useMemo(() => {
    const t = makeMarbleTexture()
    t.repeat.set(2, 2)
    return t
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      {mode === 'realistic' ? (
        <meshPhysicalMaterial
          map={marble}
          color="#0a0805"
          roughness={0.10}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.08}
          reflectivity={0.6}
        />
      ) : (
        <meshStandardMaterial map={marble} color="#0a0805" roughness={0.55} metalness={0} />
      )}
    </mesh>
  )
}

function RimLighting({ mode }: { mode: Mode }) {
  const intensity = mode === 'realistic' ? 1 : 0.6
  return (
    <>
      <ambientLight intensity={mode === 'realistic' ? 0.10 : 0.45} />
      {/* Warm key spot from upper-right (matches the reference photo lighting) */}
      <SpotLight
        position={[6, 9, 4]}
        angle={0.45}
        penumbra={0.85}
        intensity={220 * intensity}
        distance={30}
        color="#fde0a8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      {/* Cool fill from upper-left */}
      <SpotLight
        position={[-7, 8, 2]}
        angle={0.55}
        penumbra={0.95}
        intensity={45 * intensity}
        distance={30}
        color="#aeb6c8"
      />
      {/* Gold rim from behind */}
      <SpotLight
        position={[0, 4, -8]}
        angle={0.5}
        penumbra={0.9}
        intensity={100 * intensity}
        distance={25}
        color="#d4a45a"
      />
      {/* Low-front fill to softly light the label */}
      <SpotLight
        position={[0, 2, 7]}
        angle={0.6}
        penumbra={0.95}
        intensity={30 * intensity}
        distance={20}
        color="#ffeed0"
      />
    </>
  )
}

function AutoRotateGroup({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const g = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (enabled && g.current) g.current.rotation.y += dt * 0.18
  })
  return <group ref={g}>{children}</group>
}

/**
 * Fits the camera to a target product size that depends on viewport aspect.
 * On portrait viewports we pull back & raise FOV so the whole product is visible.
 */
function ResponsiveCamera({ product }: { product: Product }) {
  const { camera, size } = useThree()
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    const portrait = size.height > size.width
    // Framing diameter in world units — generous so reflections + header + footer have room.
    const targetSize = product === 'single' ? 8.5 : 13.5
    const targetY = product === 'single' ? 1.6 : 2.6
    camera.fov = portrait ? 44 : 32
    const distance = targetSize / (2 * Math.tan(((camera.fov * Math.PI) / 180) / 2))
    // Orbit position: slight elevation, three-quarter view
    const azimuth = Math.PI * 0.22
    const elevation = Math.PI * 0.14
    camera.position.set(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      Math.sin(elevation) * distance + targetY,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    )
    camera.lookAt(0, targetY, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, product])
  return null
}

type SceneProps = {
  mode: Mode
  product: Product
  autoRotate: boolean
}

export function SceneCanvas({ mode, product, autoRotate }: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [6, 4.5, 12], fov: 32 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <ResponsiveCamera product={product} />
      <color attach="background" args={[mode === 'realistic' ? '#050402' : '#0d0c0a']} />
      <fog attach="fog" args={[mode === 'realistic' ? '#050402' : '#0d0c0a', 14, 30]} />

      <Suspense fallback={null}>
        <RimLighting mode={mode} />
        {mode === 'realistic' && <Environment preset="studio" environmentIntensity={0.5} />}

        <MarbleFloor mode={mode} />

        <AutoRotateGroup enabled={autoRotate}>
          {product === 'single' ? (
            <Vial mode={mode} position={[0, 0, 0]} />
          ) : (
            <Box mode={mode} position={[0, 0, 0]} open={1} />
          )}
        </AutoRotateGroup>

        <ContactShadows
          position={[0, 0, 0]}
          opacity={mode === 'realistic' ? 0.75 : 0.5}
          scale={20}
          blur={2.6}
          far={6}
          resolution={1024}
          color="#000000"
        />

        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={6}
          maxDistance={22}
          minPolarAngle={Math.PI * 0.18}
          maxPolarAngle={Math.PI * 0.5}
          target={[0, product === 'single' ? VIAL_TOTAL_HEIGHT * 0.45 : 2.6, 0]}
        />

        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Suspense>
    </Canvas>
  )
}
