import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    // Tailwind v4: Most theme values now come from @theme in CSS
    // Keep minimal overrides here
  },
  // Note: tailwindcss-animate is replaced by tw-animate-css (imported in globals.css)
};

export default config;
