/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        paper: "#f8fafc",
        accent: "#0e7490",
        lime: "#a3e635"
      },
      fontFamily: { sans: ["Inter","system-ui","sans-serif"], mono: ["JetBrains Mono","monospace"] }
    },
  },
  plugins: [],
}
