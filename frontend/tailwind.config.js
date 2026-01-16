/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#E1ECC9',
        green: '#9ABB79',
        darkGreen: '#80A05F',
        cream: '#F3F8E9',
        vDarkGreen: '#2D3A27',
        bricky: '#c16757',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Montserrat"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
