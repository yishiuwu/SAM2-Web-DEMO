import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    function ({addUtilities}) {
      const newUtilities = {
        ".scrollbar-thin" : {
          scrollbarWidth : "thin",
          scrollbarColor : "rgb(31 29 29) transparent",
        },
        ".scrollbar-webkit" : {
          "&::-webkit-scrollbar" : {
            width: "8px"
          },
          "&::-webkit-scrollbar-track" : {
            background: "white"
          },
          "&::-webkit-scrollbar-thumb" : {
            backgroundColor: "rgb(31 41 55)", 
            borderRadius: "20px",
            border: "1px solid white"
          },
        },

        ".scrollbar-thin-dark" : {
          scrollbarWidth : "thin",
          scrollbarColor : "rgb(74 78 76) transparent",
        },
        ".scrollbar-webkit-dark" : {
          "&::-webkit-scrollbar" : {
            width: "8px"
          },
          "&::-webkit-scrollbar-track" : {
            background: "rgb(17 24 39 / var(--tw-bg-opacity))"
          },
          "&::-webkit-scrollbar-thumb" : {
            backgroundColor: "rgb(74 82 80)", 
            borderRadius: "20px",
            border: "1px solid gray"
          },
        }
      }
      addUtilities(newUtilities, ["responsive", "hover"])
    },
  ],
};
export default config;
