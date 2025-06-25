// postcss.config.js or .cjs
import tailwind from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwind(),
    autoprefixer()
  ],
}
