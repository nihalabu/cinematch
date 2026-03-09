/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#e50914",
          "red-hover": "#b81c23",
        },
        surface: {
          base: "#0a0a0a",
          card: "#141414",
          elevated: "#1f1f1f",
          highlight: "#2a2a2a",
        },
        content: {
          primary: "#ffffff",
          secondary: "#a3a3a3",
          muted: "#525252",
        },
      },
    },
  },
  plugins: [],
};
