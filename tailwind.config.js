/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'grey': 'rgb(246, 249, 250)',
        'slate-grey': '#4a5b69de',
        'primary': '#00D7C0',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

