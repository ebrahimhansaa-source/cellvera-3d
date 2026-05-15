import { useState } from 'react'
import { SceneCanvas, type Mode, type Product } from './scene/Scene'
import { Controls } from './ui/Controls'

export default function App() {
  const [mode, setMode] = useState<Mode>('realistic')
  const [product, setProduct] = useState<Product>('single')
  const [autoRotate, setAutoRotate] = useState(true)

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--color-noir-deep)] text-[var(--color-ivory)]">
      {/* Ambient gold glow behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 50%, rgba(216,180,106,0.10) 0%, rgba(216,180,106,0.03) 40%, rgba(0,0,0,0) 70%)',
        }}
      />

      {/* 3D scene */}
      <div className="absolute inset-0">
        <SceneCanvas mode={mode} product={product} autoRotate={autoRotate} />
      </div>

      {/* Top bar — brand */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 sm:px-10 sm:py-7">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-gold)]/40 bg-black/40 backdrop-blur-md">
            <span className="font-display text-lg text-[var(--color-gold-bright)]">C</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl tracking-wide text-[var(--color-gold-bright)] sm:text-2xl">
              Cellvéra<span className="align-super text-[0.55em]">®</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--color-ivory)]/55">
              Interactive Showcase
            </div>
          </div>
        </div>
        <div className="pointer-events-auto hidden items-center gap-6 text-xs uppercase tracking-[0.25em] text-[var(--color-ivory)]/55 sm:flex">
          <a href="#about" className="hover:text-[var(--color-gold-bright)]">About</a>
          <a href="#science" className="hover:text-[var(--color-gold-bright)]">Science</a>
          <a href="#contact" className="hover:text-[var(--color-gold-bright)]">Contact</a>
        </div>
      </header>

      {/* Bottom-left controls */}
      <div className="absolute bottom-0 left-0 z-10 w-full px-6 pb-6 sm:px-10 sm:pb-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--color-gold)]/70">
              {product === 'single' ? 'The Vial' : 'The Duo Set'}
            </div>
            <h1 className="font-display text-4xl leading-[1.05] text-[var(--color-ivory)] sm:text-6xl">
              {product === 'single' ? (
                <>Retatrutide <span className="text-[var(--color-gold-bright)]">30mg</span></>
              ) : (
                <>Reconstitution <span className="text-[var(--color-gold-bright)]">Set</span></>
              )}
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-ivory)]/65">
              {product === 'single'
                ? 'A single-vial presentation, finished in onyx glass and brushed-gold collar. Drag to rotate.'
                : 'Lyophilized peptide and reconstitution liquid presented in a magnetic-close drawer case. Drag to rotate.'}
            </p>
          </div>

          <Controls
            mode={mode}
            product={product}
            autoRotate={autoRotate}
            onMode={setMode}
            onProduct={setProduct}
            onAutoRotate={setAutoRotate}
          />
        </div>
      </div>

      {/* Tiny corner credit — hidden on small viewports to avoid overlapping the product */}
      <div className="pointer-events-none absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rotate-90 text-[9px] uppercase tracking-[0.45em] text-[var(--color-gold-dim)] sm:right-6 md:block">
        Drag · Scroll to zoom
      </div>
    </div>
  )
}
