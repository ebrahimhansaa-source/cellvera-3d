import { useMemo } from 'react'
import * as THREE from 'three'
import { Vial } from './Vial'
import { makeBoxLidLabel, makeLeatherTexture } from './labels'

type Mode = 'realistic' | 'stylized'

type BoxProps = {
  mode: Mode
  /** 0 = closed, 1 = fully open (lid lifted off and tilted) */
  open?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

const GOLD = '#d8b46a'
const GOLD_DEEP = '#8a6d36'

// Box dimensions
const W = 6.0
const D = 7.5
const H = 1.8

export function Box({ mode, open = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: BoxProps) {
  const leather = useMemo(() => {
    const t = makeLeatherTexture()
    t.repeat.set(2, 2)
    return t
  }, [])
  const lidLabel = useMemo(() => makeBoxLidLabel(), [])

  const lidThickness = 0.55
  const baseHeight = H
  const wallThickness = 0.18

  // When open=1, the lid floats well above and tilts back so we see the interior.
  const lidY = baseHeight + lidThickness / 2 + open * 3.6
  const lidZ = open * -1.4
  const lidTilt = open * -0.22

  // Material presets
  const leatherMat = mode === 'realistic' ? (
    <meshPhysicalMaterial
      map={leather}
      color="#0c0b0a"
      roughness={0.85}
      metalness={0}
      clearcoat={0.15}
      clearcoatRoughness={0.6}
    />
  ) : (
    <meshStandardMaterial color="#101010" roughness={0.9} />
  )

  const goldMat = (
    <meshStandardMaterial
      color={GOLD}
      roughness={mode === 'realistic' ? 0.22 : 0.5}
      metalness={mode === 'realistic' ? 1 : 0.7}
      emissive={GOLD_DEEP}
      emissiveIntensity={0.08}
    />
  )

  return (
    <group position={position} rotation={rotation}>
      {/* BASE / DRAWER */}
      <group>
        {/* Outer shell */}
        <mesh position={[0, baseHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, baseHeight, D]} />
          {leatherMat}
        </mesh>
        {/* Interior cavity — slightly inset on top */}
        <mesh position={[0, baseHeight - 0.16, 0]} receiveShadow>
          <boxGeometry args={[W - wallThickness * 2, 0.3, D - wallThickness * 2]} />
          <meshStandardMaterial color="#070605" roughness={1} />
        </mesh>
        {/* Foam insert with two vial-shaped cutouts (approximated with stacked shapes) */}
        <group position={[0, baseHeight - 0.02, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[W - wallThickness * 2 - 0.05, 0.25, D - wallThickness * 2 - 0.05]} />
            <meshStandardMaterial color="#0a0908" roughness={1} />
          </mesh>
          {/* Two darker recessed wells */}
          <mesh position={[-1.3, 0.001, 0]}>
            <cylinderGeometry args={[1.05, 1.05, 0.26, 48]} />
            <meshStandardMaterial color="#040303" roughness={1} />
          </mesh>
          <mesh position={[1.3, 0.001, 0]}>
            <cylinderGeometry args={[1.05, 1.05, 0.26, 48]} />
            <meshStandardMaterial color="#040303" roughness={1} />
          </mesh>
        </group>

        {/* Gold C monogram on front of drawer (small) */}
        <mesh position={[0, baseHeight * 0.45, D / 2 + 0.001]}>
          <planeGeometry args={[0.55, 0.55]} />
          <meshStandardMaterial
            map={lidLabel}
            transparent
            color={GOLD}
            roughness={0.45}
            metalness={0.7}
            emissive={GOLD_DEEP}
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* Gold ribbon pull at the bottom front edge */}
        <mesh position={[0, 0.05, D / 2 + 0.06]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 0.42, 0.05]} />
          {goldMat}
        </mesh>

        {/* VIALS — bottoms recessed into the foam wells, ~2/3 of height above the box rim */}
        <group position={[0, baseHeight + 0.05, 0]} scale={[0.55, 0.55, 0.55]}>
          <Vial mode={mode} position={[-2.36, -0.45, 0]} reconstitution />
          <Vial mode={mode} position={[2.36, -0.45, 0]} lyophilized />
        </group>
      </group>

      {/* LID */}
      <group position={[0, lidY, lidZ]} rotation={[lidTilt, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[W + 0.06, lidThickness, D + 0.06]} />
          {leatherMat}
        </mesh>

        {/* Gold monogram + wordmark on lid top */}
        <mesh position={[0, lidThickness / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W * 0.55, (W * 0.55) / 2]} />
          <meshStandardMaterial
            map={lidLabel}
            transparent
            color={GOLD}
            roughness={0.4}
            metalness={0.8}
            emissive={GOLD_DEEP}
            emissiveIntensity={0.12}
          />
        </mesh>

        {/* Inner felt lining on the underside of the lid */}
        <mesh position={[0, -lidThickness / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.1, D - 0.1]} />
          <meshStandardMaterial color="#070605" roughness={1} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

export const BOX_FOOTPRINT: [number, number] = [W, D]
