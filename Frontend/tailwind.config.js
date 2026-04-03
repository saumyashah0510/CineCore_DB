/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cine: {
          void:    '#080808',      // True black — the void
          onyx:    '#111010',      // Card/surface black
          velvet:  '#1A1217',      // Warm dark, like velvet curtain
          border:  '#2A2228',      // Subtle warm border
          ivory:   '#F5F0E8',      // Antique ivory — hero text
          cream:   '#C8C0B0',      // Secondary text
          dust:    '#6B6560',      // Muted/tertiary
          gold:    '#B8962E',      // Aged gold leaf — not garish, not bright
          'gold-light': '#D4AF5A', // Hover gold
          'gold-dim':   '#6B5518', // Deep gold for subtle effects
          scarlet: '#8B1A1A',      // Deep theatre scarlet — accent only
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'], // Cinematic editorial
        heading: ['"Playfair Display"', 'Georgia', 'serif'],   // Dramatic subheads
        body:    ['"DM Sans"', 'sans-serif'],                  // Clean body
        mono:    ['"JetBrains Mono"', 'monospace'],
        caption: ['"Cormorant SC"', 'Georgia', 'serif'],       // Small caps for labels
      },
      letterSpacing: {
        'ultra': '0.3em',
        'cinema': '0.5em',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}