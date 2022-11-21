/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'lilith': '#ed2b5b',
        'lilith-hover': '#ba2147',
        'blurple': '#5865F2',
        'lgray': {
          600: '#515151',
          700: '#2b2b2b',
          750: '#222222',
          800: '#1E1E1E',
          900: '#171717'
        }
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif']
      },
    },
  },
  plugins: []
}
