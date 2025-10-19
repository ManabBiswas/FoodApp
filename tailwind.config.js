/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ensure Tailwind scans files in the Expo Router `app/` directory
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app-example/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: ["class"],
}

