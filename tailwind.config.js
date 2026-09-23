/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#060911',
          900: '#090d16',
          850: '#0e1422',
          800: '#141c2e',
          700: '#1e293b',
          600: '#334155',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(99, 102, 241, 0.2)',
        'glow-md': '0 0 25px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 35px rgba(99, 102, 241, 0.45)',
      },
    },
  },
  plugins: [],
};
