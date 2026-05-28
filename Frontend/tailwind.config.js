/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2fb",
          100: "#d5e0f4",
          200: "#abc1e9",
          300: "#7fa6e0",
          400: "#5f8ed8",
          500: "#4a7fd4",
          600: "#2c5aa9",
          700: "#1e4080",
          800: "#152d5c",
          900: "#0d1e3d",
        },

        danger: "#ee3c3c",

        bg: "#FAF8F5",
      },

      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Sora", "sans-serif"],
      },

      boxShadow: {
        card: "0 2px 16px rgba(44,90,169,0.08)",
        "card-hover": "0 8px 32px rgba(44,90,169,0.16)",
        glow: "0 0 20px rgba(44,90,169,0.2)",
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },

  plugins: [],
};