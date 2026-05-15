import type { Mode, Product } from '../scene/Scene'

type Props = {
  mode: Mode
  product: Product
  autoRotate: boolean
  onMode: (m: Mode) => void
  onProduct: (p: Product) => void
  onAutoRotate: (v: boolean) => void
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold-dim)]">
        {label}
      </span>
      <div className="inline-flex rounded-full border border-[var(--color-gold)]/25 bg-black/60 p-1 backdrop-blur-md">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={
                'rounded-full px-3.5 py-1.5 text-xs tracking-wide transition-colors ' +
                (active
                  ? 'bg-gradient-to-b from-[var(--color-gold-bright)] to-[var(--color-gold)] text-black shadow-[0_0_18px_-2px_rgba(216,180,106,0.5)]'
                  : 'text-[var(--color-ivory)]/70 hover:text-[var(--color-gold-bright)]')
              }
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Controls({
  mode,
  product,
  autoRotate,
  onMode,
  onProduct,
  onAutoRotate,
}: Props) {
  return (
    <div className="pointer-events-auto flex flex-wrap items-end gap-5">
      <Segmented<Product>
        label="Product"
        value={product}
        onChange={onProduct}
        options={[
          { value: 'single', label: 'Single Vial' },
          { value: 'duo', label: 'Duo Box' },
        ]}
      />
      <Segmented<Mode>
        label="Render"
        value={mode}
        onChange={onMode}
        options={[
          { value: 'realistic', label: 'Realistic' },
          { value: 'stylized', label: 'Stylized' },
        ]}
      />
      <label className="flex cursor-pointer items-center gap-2 self-center text-xs text-[var(--color-ivory)]/70 hover:text-[var(--color-gold-bright)]">
        <input
          type="checkbox"
          checked={autoRotate}
          onChange={(e) => onAutoRotate(e.target.checked)}
          className="h-3.5 w-3.5 accent-[var(--color-gold)]"
        />
        Auto-rotate
      </label>
    </div>
  )
}
