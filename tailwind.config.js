import { heroui } from '@heroui/react'

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
    // './node_modules/@heroui/theme/dist/components/(card|image|table|toast|user|ripple|checkbox|form|spacer|spinner|avatar).js'
  ],
  theme: {
    extend: {}
  },
  darkMode: 'class',
  plugins: [
    heroui(),
    function ({ addUtilities }) {
      addUtilities({
        '.app-drag': {
          // 拖拽
          '-webkit-app-region': 'drag'
        },
        '.app-no-drag': {
          // 不可拖拽
          '-webkit-app-region': 'no-drag'
        }
      })
    }
  ]
}
