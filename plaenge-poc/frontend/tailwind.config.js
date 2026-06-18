/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: ['bg-plaenge-700', 'bg-purple-600', 'bg-blue-600'],
  theme: {
    extend: {
      colors: {
        plaenge: {
          50:  '#f0f9f4',
          100: '#dcf0e5',
          200: '#bbe1cc',
          300: '#8ecaaa',
          400: '#5aac83',
          500: '#388f64',
          600: '#27744f',
          700: '#1f5d40',
          800: '#1b4a34',
          900: '#163d2b',
        },
      },
    },
  },
  plugins: [],
};
