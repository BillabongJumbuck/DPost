/** @type {import('tailwindcss').Config} */

import preset from "./ui-preset"
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [preset],
}
