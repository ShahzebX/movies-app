const { default: tailwindcss } = require("@tailwindcss/vite");

module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./*.html", // Adjust based on your project structure
  ],
  theme: {
    extend: {
      colors: {
        primary: "#030014",
        light: {
          100: "#cecefb",
          200: "#a8b5db",
        },
        gray: {
          100: "#9ca4ab",
        },
        dark: {
          100: "#0f0d23",
        },
      },
      fontFamily: {
        "dm-sans": ["DM Sans", "sans-serif"],
      },
      screens: {
        xs: "480px",
      },
      backgroundImage: {
        "hero-pattern": "url('/hero-bg.png')",
      },
    },
  },
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
