import tailwindForms from '@tailwindcss/forms'
import { type Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { gray: colors.neutral }
    }
  },
  plugins: [tailwindForms]
} satisfies Config
