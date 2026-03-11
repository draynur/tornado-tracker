import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        mag: {
          '-9': '#6b7280',
          '0': '#86efac',
          '1': '#fde047',
          '2': '#fb923c',
          '3': '#f87171',
          '4': '#c026d3',
          '5': '#7f1d1d',
        },
      },
    },
  },
} satisfies Config
