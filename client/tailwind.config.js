/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        iit: {
          primary: '#1e3a5f',
          secondary: '#2d5a87',
          light: '#4a7eb0',
          accent: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}
