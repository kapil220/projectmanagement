// tailwind.config.js
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        poppins: ['poppins', 'sans-serif'], // Added Roboto
      },
      fontSize: {
        'custom-16': '16px',
        'custom-15': '15px',
        'custom-18': '18px',
        'custom-20': '20px',
        'custom-29.7': '29.7px',
        'custom-8': '8px',
        'custom-10': '10px', // Added custom font size
      },
      lineHeight: {
        'custom-19.36': '19.36px',
        'custom-18.15': '18.15px',
        'custom-21.78': '21.78px',
        'custom-21.09': '21.09px', // Added custom line height
        'custom-24.2': '24.2',
        'custom-16.2': '16.2',
        'custom-9.68': '9.68px', // Added custom line height
      },
      fontWeight: {
        'custom-200': 200,
        'custom-300': 300,
        'custom-400': 400,
        'custom-500': 500,
        'custom-600': 600,
      },
      colors: {
        view: 'rgba(235, 228, 224, 1)',
        borderdelete: 'rgba(145, 145, 146, 1)',
        children: 'rgba(31, 31, 32, 1)',
        heading: 'rgba(13, 22, 21, 1)',
        chat: 'rgba(28, 25, 23, 1)',
        head: 'rgba(28, 25, 23, 0.8)',
        drawercolor: 'rgba(32,34,36,1)',
        drawerhover: 'rgba(32, 34, 36, 0.35)',
        backgroundcolor: 'rgba(253, 244, 232, 1)',
        customorange: 'rgba(234, 88, 12, 1)',
        notificationrecent: 'rgba(235,4,4,1)',
        chatbg: 'rgba(247, 247, 247, 1)',
        backgroundadd: 'rgba(255,255, 255, 1)',
        delete: 'rgba(251, 25, 64, 1)',
        dropdown: 'rgba(247, 247, 247, 1)',
        messageinput: 'rgba(85, 85, 89, 0.59)',
        active: 'rgba(155, 155, 157, 1)',
        gg: 'rgba(231, 231, 231, 1)',
        ggbg: 'rgba(246, 244, 244, 1)',
        filesize: 'rgba(109, 109, 109, 1)',
        overdue: 'rgba(251, 25, 64, 1)',
        today: 'rgba(255, 181, 52, 1)',
        nodue: 'rgba(15, 176, 133, 1)',
        kk: 'rgba(97, 96, 94, 1)',
        voicebg: 'rgba(255, 233, 222, 1)',
        head2: 'rgba(60, 58, 58, 0.7)',
        delete2: 'rgba(255, 8, 65, 1)',
      },
      backdropFilter: {
        none: 'none',
        blur: 'blur(10px)',
      },
      filter: {
        'custom-default':
          'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(103%) contrast(103%)',
        'custom-active':
          'brightness(0) saturate(100%) invert(44%) sepia(79%) saturate(2684%) hue-rotate(359deg) brightness(103%) contrast(106%)',
      },
    },
  },
  variants: {
    extend: {
      backdropFilter: ['responsive', 'hover', 'focus'],
      filter: ['responsive', 'hover', 'focus'],
      scrollbar: ['rounded'], // Add this line to enable rounded scrollbar variant
    },
  },
  daisyui: {
    themes: ['corporate', 'black'],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    require('tailwindcss-filters'),
    require('tailwind-scrollbar')({ nocompatible: true }), // Add the tailwind-scrollbar plugin
  ],
  // Add the custom filter utility
};
