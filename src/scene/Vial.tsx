import { useMemo } from 'react'
import * as THREE from 'three'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { makeVialLabel } from './labels'

type Mode = 'realistic' | 'stylized'

type VialProps = {
  mode: Mode
  product?: string
  dose?: string
  /** If true, the vial contains lyophilized powder instead of clear liquid. */
  lyophilized?: boolean
  /** If true, the bottle reads "RECONSTITUTION LIQUID / 3mL" (clear liquid). */
  reconstitution?: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
}

const GOLD = '#d8b46a'
const GOLD_DEEP = '#8a6d36'
const CAP_BLACK = '#111111'

// Profile points for the glass vial body, lathed around Y axis.
// All in centimeters; the body is ~3 wide, ~5 tall.
const VIAL_PROFILE: Array<[number, number]> = [
  [0.00, 0.00],
  [0.85, 0.00],
  [0.95, 0.04],
  [0.97, 0.12],
  [0.97, 2.55],
  [0.92, 2.75],
  [0.65, 2.95],
  [0.55, 3.05],
  [0.55, 3.45],
  [0.60, 3.50],
  [0.60, 3.52],
  [0.00, 3.52],
]

function makeLatheGeometry(profile: Array<[number, number]>, segments = 96) {
  const pts = profile.map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(pts, segments)
}

export function Vial({
  mode,
  product = 'RETATRUTIDE',
  dose = '30mg',
  lyophilized = false,
  reconstitution = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: VialProps) {
  const labelTex = useMemo(
    () =>
      reconstitution
        ? makeVialLabel({ product: 'RECONSTITUTION', dose: 'LIQUID  3mL' })
        : makeVialLabel({ product, dose }),
    [product, dose, reconstitution],
  )

  const bodyGeom = useMemo(() => makeLatheGeometry(VIAL_PROFILE, 96), [])

  // Label is a cylinder wrapping the lower half of the body
  const labelHeight = 1.35
  const labelY = 1.05
  const labelRadius = 0.98

  // Liquid sits inside the body
  const liquidHeight = lyophilized ? 0.7 : 2.2
  const liquidY = liquidHeight / 2 + 0.05

  // Cap geometry: gold collar + black plastic top
  const collarHeight = 0.18
  const capHeight = 0.32
  const capRadius = 0.62
  const collarY = 3.52 + collarHeight / 2
  const capY = collarY + collarHeight / 2 + capHeight / 2

  return (
    <group position={position} rotation={rotation}>
      {/* GLASS BODY */}
      <mesh geometry={bodyGeom} castShadow receiveShadow>
        {mode === 'realistic' ? (
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={0.35}
            roughness={0.02}
            ior={1.45}
            chromaticAberration={0.04}
            anisotropy={0.1}
            distortion={0.0}
            distortionScale={0.2}
            temporalDistortion={0.0}
            transmission={1}
            clearcoat={1}
            attenuationDistance={1.2}
            attenuationColor="#f6efde"
            color="#ffffff"
          />
        ) : (
          <meshPhysicalMaterial
            color="#e9e3d2"
            roughness={0.15}
            metalness={0}
            transmission={0.7}
            thickness={0.4}
            ior={1.4}
            transparent
            opacity={0.55}
          />
        )}
      </mesh>

      {/* LIQUID / POWDER */}
      <mesh position={[0, liquidY, 0]} castShadow>
        <cylinderGeometry args={[0.92, 0.92, liquidHeight, 64]} />
        {lyophilized ? (
          <meshStandardMaterial color="#f4ead2" roughness={0.85} metalness={0} />
        ) : reconstitution ? (
          <meshPhysicalMaterial
            color="#f7f1de"
            roughness={0.05}
            transmission={0.95}
            thickness={1}
            ior={1.33}
            transparent
            opacity={0.85}
          />
        ) : (
          <meshPhysicalMaterial
            color="#e8c87a"
            roughness={0.05}
            transmission={0.85}
            thickness={1}
            ior={1.36}
            transparent
            opacity={0.78}
            attenuationDistance={0.8}
            attenuationColor="#c9a35a"
          />
        )}
      </mesh>

      {/* LABEL (wraparound cylinder; rotated so the wordmark faces +X/+Z toward the camera). */}
      <mesh position={[0, labelY, 0]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[labelRadius, labelRadius, labelHeight, 64, 1, true]} />
        <meshStandardMaterial
          map={labelTex}
          roughness={0.55}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* GOLD COLLAR */}
      <mesh position={[0, collarY, 0]} castShadow>
        <cylinderGeometry args={[capRadius, capRadius * 0.95, collarHeight, 48]} />
        <meshStandardMaterial
          color={GOLD}
          roughness={mode === 'realistic' ? 0.18 : 0.5}
          metalness={mode === 'realistic' ? 1 : 0.7}
          emissive={GOLD_DEEP}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* BLACK PLASTIC CAP TOP */}
      <mesh position={[0, capY, 0]} castShadow>
        <cylinderGeometry args={[capRadius * 0.92, capRadius, capHeight, 48]} />
        <meshStandardMaterial
          color={CAP_BLACK}
          roughness={mode === 'realistic' ? 0.35 : 0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Tiny gold ring detail recessed on top of cap (laid flat) */}
      <mesh position={[0, capY + capHeight / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[capRadius * 0.55, capRadius * 0.82, 48]} />
        <meshStandardMaterial color={GOLD_DEEP} side={THREE.DoubleSide} roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  )
}

export const VIAL_TOTAL_HEIGHT = 3.52 + 0.18 + 0.32
