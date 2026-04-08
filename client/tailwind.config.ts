import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // D-01: Primary brand — gold amber extraído del logo BEEPYRED
        brand: {
          DEFAULT: '#F5A800',
          hover: '#D98F00',
        },
        // D-02: Fondo de página — near-black
        page: '#0A0A0A',
        // D-03: Superficie (cards, paneles) — zinc-900
        surface: '#18181B',
        // D-04: Borde — zinc-800
        border: '#27272A',
        // D-05: Texto
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',   // zinc-400
          muted: '#71717A',       // zinc-500 — para subtítulos y labels
        },
        // D-06: Error accent — red-500
        error: '#EF4444',
      },
    },
  },
  plugins: [],
}

export default config
