/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F0F',
        surface: '#1A1A1A',
        primary: {
          DEFAULT: '#3B82F6', // Electric Blue
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Violet
          foreground: '#FFFFFF',
        },
        muted: '#A1A1AA',
      },
    },
  },
  plugins: [],
}
