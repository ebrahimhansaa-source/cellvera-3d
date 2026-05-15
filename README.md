# Cellvéra® — Interactive 3D Showcase

Procedural Three.js scene rendering the Cellvéra® Retatrutide vial and the duo
reconstitution set in the browser. Drag to rotate, scroll to zoom. Toggle
between a **Realistic** mode (glass refraction, PBR gold, marble reflections)
and a **Stylized** mode (faster, lower-poly).

Built with React + Vite + TypeScript + react-three-fiber + drei + Tailwind v4.
No external 3D assets — every product, label, monogram, leather and marble
surface is generated procedurally at runtime.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
npm run preview  # serve the production build
```

## Project layout

```
src/
  App.tsx                  page chrome, headline, controls overlay
  index.css                Tailwind v4 theme tokens (gold, ivory, noir)
  scene/
    Scene.tsx              R3F Canvas + lighting + responsive camera
    Vial.tsx               glass body (lathe), gold collar, black cap, label
    Box.tsx                drawer base + lid, foam wells, two vials
    labels.ts              CanvasTextures: Cellvéra monogram, label artwork,
                           leather grain, marble veining
  ui/
    Controls.tsx           Single/Duo and Realistic/Stylized segmented toggles
```

## Notes

- **All textures are generated in `<canvas>` at runtime.** Swap them out for
  flat artwork by importing PNGs and replacing the `makeXxxTexture` calls in
  `labels.ts`.
- **Embedding into another site:** `npm run build` emits a static bundle under
  `dist/`. The Vite config uses `base: './'` so it can be dropped into any
  subdirectory or iframe.
- **Realistic mode** uses `MeshTransmissionMaterial` from drei for the glass
  vial body. On low-end devices, switch to Stylized for ~2× the framerate.
