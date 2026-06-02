/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5B9BD5',
        'primary-hover': '#4A8AC4',
        'app-bg': '#F0F6FC',
        'card-border': '#D6E4F0',
        'card-hover': '#E8F2FB',
        'text-main': '#2C3E50',
        'text-secondary': '#7F8C8D',
        'search-border': '#C8DAEA',
        'pin-color': '#E67E22',
        'delete-color': '#E74C3C',
      },
    },
  },
  plugins: [],
};
