import * as THREE from 'three'

const GOLD = '#d8b46a'
const GOLD_BRIGHT = '#f1d588'
const BLACK = '#080808'

function drawMonogram(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Two interlocking arcs forming the "C-with-crescent" Cellvéra mark.
  ctx.save()
  ctx.translate(cx, cy)

  const grad = ctx.createLinearGradient(0, -r, 0, r)
  grad.addColorStop(0, GOLD_BRIGHT)
  grad.addColorStop(0.55, GOLD)
  grad.addColorStop(1, '#a8853f')

  ctx.strokeStyle = grad
  ctx.lineCap = 'round'
  ctx.lineWidth = r * 0.16

  // Outer C (open on the right)
  ctx.beginPath()
  ctx.arc(0, 0, r, Math.PI * 0.32, Math.PI * 1.68, false)
  ctx.stroke()

  // Inner reverse-C (open on the left), nested inside the upper-right gap
  ctx.lineWidth = r * 0.13
  ctx.beginPath()
  ctx.arc(r * 0.18, -r * 0.02, r * 0.55, Math.PI * 1.18, Math.PI * 0.82, false)
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
  const W = 1024
  const H = 1024
  const c = makeCanvas(W, H)
  const ctx = c.getContext('2d')!

  // Base black label
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, W, H)

  // Subtle vertical sheen
  const sheen = ctx.createLinearGradient(0, 0, W, 0)
  sheen.addColorStop(0, 'rgba(255,255,255,0)')
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.04)')
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, W, H)

  // Top hairline
  ctx.strokeStyle = 'rgba(216,180,106,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W * 0.15, H * 0.08)
  ctx.lineTo(W * 0.85, H * 0.08)
  ctx.stroke()

  // Monogram
  drawMonogram(ctx, W / 2, H * 0.32, W * 0.13)

  // Brand
  ctx.fillStyle = GOLD_BRIGHT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 110px "Cormorant Garamond", "Times New Roman", serif'
  ctx.fillText('Cellvéra®', W / 2, H * 0.52)

  // Divider
  ctx.strokeStyle = 'rgba(216,180,106,0.55)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(W * 0.30, H * 0.62)
  ctx.lineTo(W * 0.70, H * 0.62)
  ctx.stroke()

  // Product
  ctx.fillStyle = GOLD
  ctx.font = '600 78px "Inter", system-ui, sans-serif'
  ctx.fillText(opts.product, W / 2, H * 0.72)

  // Dose
  ctx.fillStyle = GOLD_BRIGHT
  ctx.font = '400 64px "Inter", system-ui, sans-serif'
  ctx.fillText(opts.dose, W / 2, H * 0.82)

  // Bottom hairline
  ctx.strokeStyle = 'rgba(216,180,106,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W * 0.15, H * 0.92)
  ctx.lineTo(W * 0.85, H * 0.92)
  ctx.stroke()

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
