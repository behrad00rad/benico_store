/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  daisyui: {
    themes: [
      {
        benidark: {

            "primary": "#0a0a0a",
            "base-content": "#f5f5f5",
            "secondary-content": "#f5f5f5",
                    
            "secondary": "#1e1e1e",
                    
            "accent": "#fdfdfd",
                    
            "neutral": "#888",
                    
            "base-100": "#0a0a0a",
                    
            "info": "#3abff8",
                    
            "success": "#36d399",
                    
            "warning": "#fbbd23",
                    
            "error": "#f87272",
        },
        benilight: {
          
          "primary": "#fdfdfd",
          "base-content": "#171717",
          "secondary-content": "#171717",
          
          "secondary": "#ededed",
                   
          "accent": "#0a0a0a",
                   
          "neutral": "#666",

          "base-100": "#fdfdfd",
                   
          "info": "#0369a1",
                   
          "success": "#36d399",
                   
          "warning": "#fbbd23",
                   
          "error": "#f87272",
                   },
      },
    ],
  },
  theme: {
    fontFamily:{
      mont:['Montserrat'],
      ral:['Raleway'],
      yek:['IRANYekan'],
    },
    extend: {},
  },
  plugins: [require("daisyui")],
}

