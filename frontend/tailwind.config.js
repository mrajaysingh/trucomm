/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'turcomm': ['Aviano Future Heavy', 'sans-serif'],
        'menu': ['Good Times Rg', 'sans-serif'],
        'heading': ['Nasalization Rg', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
