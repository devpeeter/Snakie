/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-primary': '#ff6c00',
        'game-secondary': '#000000',
        'game-accent': '#ffff00',
      },
      fontFamily: {
        'game': ['Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}