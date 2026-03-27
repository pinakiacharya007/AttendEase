import type {Config} from 'tailwindcss'
const config:Config={
  content:['./src/**/*.{ts,tsx}'],
  theme:{extend:{fontFamily:{sans:['Plus Jakarta Sans','system-ui','sans-serif']}}},
  plugins:[require('tailwindcss-animate')],
}
export default config
