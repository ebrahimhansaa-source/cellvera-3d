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
const CAP_BLACK = '#0f0f0f'

/**
 * Pharma vial profile — short, chunky body with a pronounced shoulder.
 * Body height ~2.2 vs body diameter ~2.0 (aspect 1.1 : 1, intentionally stubby).
 * X = radius, Y = vertical position; rotated around the Y axis via LatheGeometry.
 */
const VIAL_PROFILE: Array<[number, number]> = [
  [0.00, 0.00],
  [0.92, 0.00],
  [1.00, 0.06],
  [1.00, 1.95],
  [0.97, 2.05],
  [0.82, 2.18],
  [0.65, 2.30],
  [0.55, 2.42],
  [0.55, 2.62],
  [0.62, 2.68],
  [0.62, 2.72],
  [0.00, 2.72],
]

const GLASS_TOP = 2.72

// Cap dimensions — designed to be visually dominant like the reference photo.
const GOLD_COLLAR_RADIUS = 0.72
const GOLD_COLLAR_HEIGHT = 0.55
const GOLD_COLLAR_Y = GLASS_TOP - 0.05 + GOLD_COLLAR_HEIGHT / 2 // overlap glass crimp slightly

const BLACK_CAP_RADIUS = 0.60
const BLACK_CAP_HEIGHT = 0.95
const BLACK_CAP_Y = GLASS_TOP + GOLD_COLLAR_HEIGHT - 0.05 + BLACK_CAP_HEIGHT / 2

const TOTAL_HEIGHT = BLACK_CAP_Y + BLACK_CAP_HEIGHT / 2

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
        ? makeVialLabel({ product: 'RECONSTITUTION', dose: 'LIQUID  ·  3mL' })
        : makeVialLabel({ product, dose }),
    [product, dose, reconstitution],
  )

  const bodyGeom = useMemo(() => makeLatheGeometry(VIAL_PROFILE, 96), [])

  // Label: centered on the body cylinder, takes ~55% of body height
  const labelHeight = 1.15
  const labelY = 0.95
  const labelRadius = 1.01

  // Contents — lyophilized fills less of the vial than liquid
  const contentsHeight = lyophilized ? 0.55 : 1.55
  const contentsY = contentsHeight / 2 + 0.08

  return (
    <group position={position} rotation={rotation}>
      {/* GLASS BODY */}
      <mesh geometry={bodyGeom} castShadow receiveShadow>
        {mode === 'realistic' ? (
          <MeshTransmissionMaterial
            backside
            samples={10}
            thickness={0.15}
            roughness={0}
            ior={1.5}
            chromaticAberration={0.02}
            anisotropy={0.05}
            distortion={0}
            transmission={1}
            clearcoat={1}
            attenuationDistance={50}
            attenuationColor="#ffffff"
            color="#ffffff"
          />
        ) : (
          <meshPhysicalMaterial
            color="#f7faf8"
            roughness={0.02}
            metalness={0}
            transmission={0.98}
            thickness={0.1}
            ior={1.5}
            transparent
            opacity={0.45}
          />
        )}
      </mesh>

      {/* LIQUID / POWDER */}
      <mesh position={[0, contentsY, 0]} castShadow>
        <cylinderGeometry args={[0.96, 0.96, contentsHeight, 64]} />
        {lyophilized ? (
          // Lyophilized peptide — cream-white solid pellet, slightly textured
          <meshStandardMaterial color="#f2e8ce" roughness={0.95} metalness={0} />
        ) : reconstitution ? (
          // Reconstitution liquid — clear, very faint blue tint
          <meshPhysicalMaterial
            color="#f5f9f7"
            roughness={0.05}
            transmission={0.96}
            thickness={1.2}
            ior={1.33}
            transparent
            opacity={0.65}
          />
        ) : (
          // Default peptide solution — nearly clear, faintest warm tint
          <meshPhysicalMaterial
            color="#fbf6e6"
            roughness={0}
            transmission={0.98}
            thickness={0.5}
            ior={1.36}
            transparent
            opacity={0.30}
            attenuationDistance={8}
            attenuationColor="#f0e2b8"
          />
        )}
      </mesh>

      {/* LABEL — wraparound cylinder, rotated so the wordmark center aligns with the camera azimuth */}
      <mesh position={[0, labelY, 0]} rotation={[0, -Math.PI * 0.78, 0]}>
        <cylinderGeometry args={[labelRadius, labelRadius, labelHeight, 96, 1, true]} />
        <meshStandardMaterial
          map={labelTex}
          roughness={0.6}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* GOLD CRIMP COLLAR — the dominant gold band wrapping the neck and extending above */}
      <mesh position={[0, GOLD_COLLAR_Y, 0]} castShadow>
        <cylinderGeometry
          args={[GOLD_COLLAR_RADIUS, GOLD_COLLAR_RADIUS * 1.04, GOLD_COLLAR_HEIGHT, 64]}
        />
        <meshStandardMaterial
          color={mode === 'realistic' ? '#e6c478' : GOLD}
          roughness={mode === 'realistic' ? 0.12 : 0.45}
          metalness={mode === 'realistic' ? 1 : 0.75}
          emissive={mode === 'realistic' ? '#5a4419' : GOLD_DEEP}
          emissiveIntensity={mode === 'realistic' ? 0.08 : 0.06}
        />
      </mesh>

      {/* Thin gold seam line at the bottom of the collar (decorative) */}
      <mesh position={[0, GOLD_COLLAR_Y - GOLD_COLLAR_HEIGHT / 2 + 0.02, 0]}>
        <cylinderGeometry
          args={[GOLD_COLLAR_RADIUS * 1.05, GOLD_COLLAR_RADIUS * 1.05, 0.04, 64]}
        />
        <meshStandardMaterial color={GOLD_DEEP} roughness={0.5} metalness={0.9} />
      </mesh>

      {/* BLACK PLASTIC FLIP-CAP — sits on top of the gold collar */}
      <mesh position={[0, BLACK_CAP_Y, 0]} castShadow>
        <cylinderGeometry
          args={[BLACK_CAP_RADIUS, BLACK_CAP_RADIUS + 0.02, BLACK_CAP_HEIGHT, 64]}
        />
        <meshStandardMaterial
          color={CAP_BLACK}
          roughness={mode === 'realistic' ? 0.35 : 0.65}
          metalness={mode === 'realistic' ? 0.05 : 0.15}
        />
      </mesh>

      {/* Top of the black cap — slight inset disc for a finished look */}
      <mesh position={[0, BLACK_CAP_Y + BLACK_CAP_HEIGHT / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BLACK_CAP_RADIUS * 0.94, 64]} />
        <meshStandardMaterial color={CAP_BLACK} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Gold ring inlay on top of the black cap (matches reference detail) */}
      <mesh position={[0, BLACK_CAP_Y + BLACK_CAP_HEIGHT / 2 + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[BLACK_CAP_RADIUS * 0.55, BLACK_CAP_RADIUS * 0.72, 64]} />
        <meshStandardMaterial
          color={GOLD}
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={1}
          emissive={GOLD_DEEP}
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  )
}

export const VIAL_TOTAL_HEIGHT = TOTAL_HEIGHT
