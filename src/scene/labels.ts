import * as THREE from 'three'

const GOLD = '#d8b46a'
const GOLD_BRIGHT = '#f1d588'
const BLACK = '#080808'

function drawMonogram(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Cellvéra mark: a large open-right "C" with a smaller inner crescent that
  // nests into the gap, echoing the lid imprint on the duo box.
  ctx.save()
  ctx.translate(cx, cy)

  const grad = ctx.createLinearGradient(0, -r, 0, r)
  grad.addColorStop(0, GOLD_BRIGHT)
  grad.addColorStop(0.55, GOLD)
  grad.addColorStop(1, '#a8853f')

  ctx.strokeStyle = grad
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Outer C — open on the right with a moderate gap
  ctx.lineWidth = r * 0.18
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.95, Math.PI * 0.28, Math.PI * 1.72, false)
  ctx.stroke()

  // Inner crescent — a small reverse-C tucked into the upper-right of the opening
  ctx.lineWidth = r * 0.14
  ctx.beginPath()
  ctx.arc(r * 0.32, -r * 0.05, r * 0.42, Math.PI * 0.6, Math.PI * 1.4, true)
  ctx.stroke()

  ctx.restore()
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

export function makeVialLabel(opts: { product: string; dose: string }): THREE.CanvasTexture {
  // Wider canvas (2:1) so when wrapped around the cylinder, the artwork only
  // covers ~half the circumference — leaving the rest plain black like a real
  // wraparound label and keeping the text readable from one direction.
  const W = 2048
  const H = 1024
  const c = makeCanvas(W, H)
  const ctx = c.getContext('2d')!

  // Base black label
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, W, H)

  // Subtle vertical sheen
  const sheen = ctx.createLinearGradient(0, 0, W, 0)
  sheen.addColorStop(0, 'rgba(255,255,255,0)')
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.03)')
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, W, H)

  // Artwork is centered horizontally and scaled relative to height (so it looks
  // right on the cylinder regardless of how wide we make the canvas).
  const cx = W / 2

  // Monogram
  drawMonogram(ctx, cx, H * 0.27, H * 0.10)

  // Brand wordmark
  ctx.fillStyle = GOLD_BRIGHT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 96px "Cormorant Garamond", "Times New Roman", serif'
  ctx.fillText('Cellvéra®', cx, H * 0.48)

  // Divider
  ctx.strokeStyle = 'rgba(216,180,106,0.55)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - H * 0.10, H * 0.60)
  ctx.lineTo(cx + H * 0.10, H * 0.60)
  ctx.stroke()

  // Product
  ctx.fillStyle = GOLD
  ctx.font = '600 60px "Inter", system-ui, sans-serif'
  ctx.letterSpacing = '4px'
  ctx.fillText(opts.product, cx, H * 0.70)

  // Dose
  ctx.fillStyle = GOLD_BRIGHT
  ctx.font = '400 52px "Inter", system-ui, sans-serif'
  ctx.fillText(opts.dose, cx, H * 0.80)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  tex.needsUpdate = true
  return tex
}

export function makeBoxLidLabel(): THREE.CanvasTexture {
  const W = 2048
  const H = 1024
  const c = makeCanvas(W, H)
  const ctx = c.getContext('2d')!

  // Transparent base so the underlying box leather shows
  ctx.clearRect(0, 0, W, H)

  // Monogram top-center
  drawMonogram(ctx, W / 2, H * 0.42, W * 0.085)

  // Brand wordmark below
  ctx.fillStyle = GOLD_BRIGHT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 200px "Cormorant Garamond", "Times New Roman", serif'
  ctx.fillText('Cellvéra®', W / 2, H * 0.72)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  tex.needsUpdate = true
  return tex
}

export function makeLeatherTexture(): THREE.CanvasTexture {
  const S = 1024
  const c = makeCanvas(S, S)
  const ctx = c.getContext('2d')!

  ctx.fillStyle = '#0c0b0a'
  ctx.fillRect(0, 0, S, S)

  // Pebbled grain dots
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * S
    const y = Math.random() * S
    const a = Math.random() * 0.06
    const r = 0.6 + Math.random() * 1.6
    ctx.fillStyle = `rgba(${30 + Math.random() * 30},${24 + Math.random() * 20},${18 + Math.random() * 14},${a})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  // Faint highlight specks
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * S
    const y = Math.random() * S
    ctx.fillStyle = `rgba(255,235,200,${Math.random() * 0.04})`
    ctx.fillRect(x, y, 1, 1)
  }

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

export function makeMarbleTexture(): THREE.CanvasTexture {
  const S = 1024
  const c = makeCanvas(S, S)
  const ctx = c.getContext('2d')!

  // Deep black base with a faint warm bias
  const base = ctx.createLinearGradient(0, 0, S, S)
  base.addColorStop(0, '#050402')
  base.addColorStop(1, '#0a0805')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, S, S)

  // Gold veins — irregular polylines
  const drawVein = (alpha: number, width: number) => {
    ctx.strokeStyle = `rgba(201,163,90,${alpha})`
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.beginPath()
    let x = Math.random() * S
    let y = Math.random() * S
    ctx.moveTo(x, y)
    const segments = 30 + Math.floor(Math.random() * 30)
    const angle = Math.random() * Math.PI * 2
    for (let i = 0; i < segments; i++) {
      x += Math.cos(angle + (Math.random() - 0.5) * 0.8) * (15 + Math.random() * 30)
      y += Math.sin(angle + (Math.random() - 0.5) * 0.8) * (15 + Math.random() * 30)
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  for (let i = 0; i < 14; i++) drawVein(0.18 + Math.random() * 0.25, 0.6 + Math.random() * 1.4)
  for (let i = 0; i < 6; i++) drawVein(0.05 + Math.random() * 0.08, 2 + Math.random() * 2.5)

  // Subtle noise
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * S
    const y = Math.random() * S
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.015})`
    ctx.fillRect(x, y, 1, 1)
  }

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 16
  tex.needsUpdate = true
  return tex
}
