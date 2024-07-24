import tailwindcssAnimate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
export const darkMode = ["class"];
export const content = [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './app/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
];
export const prefix = "";
export const theme = {
  container: {
    center: true,
    padding: "2rem",
    screens: {
      "2xl": "1400px",
    },
  },
  extend: {
    fontFamily: {
      'sans': ['Helvetica', 'Arial', 'sans-serif'],
      'lato' : ['Lato', 'sans-serif'],
      'inter' : ['Inter', 'sans-serif'],
      'roboto' : ['Roboto', 'sans-serif'],
      'tilt'  : ['Tilt Prism', 'sans-serif'],
      'mono' : ['Roboto Mono', 'monospace'],
      'instrument' : ['Instrument Serif', 'serif'],
    },
    keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
      move: {
        '0%, 100%': { transform: 'translateX(0)' },
        '50%': { transform: 'translateX(10px)' },
      },
      smoke: {
        '0%': { opacity: 0, transform: 'translateY(0)' },
        '50%': { opacity: 1, transform: 'translateY(-10px)' },
        '100%': { opacity: 0, transform: 'translateY(-20px)' },
      },
      write: {
        '0%, 100%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
        '50%': { transform: 'translate(-50%, -50%) rotate(-20deg)' },
      },
      delete: {
        '0%, 100%': { transform: 'rotate(0deg)' },
        '50%': { transform: 'rotate(-20deg)' },
      },
      check: {
        '0%, 100%': { transform: 'scale(1)', opacity: 1 },
        '50%': { transform: 'scale(1.2)', opacity: 0.5 },
      },
    'thumbs-up': {
      '0%, 100%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.2)', opacity: 0.8 },
    },
    'edit-pencil': {
      '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
      '50%': { transform: 'translate(5px, -5px) rotate(-10deg)' },
    },
    send: {
      '0%, 100%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.2)', opacity: 0.7 },
    },
    rocket: {
      '0%': { 
        transform: 'translateY(0) rotate(0deg) scale(1)', 
        opacity: 1 
      },
      '50%': { 
        transform: 'translateY(-30px) rotate(-45deg) scale(1.2)', 
        opacity: 0.7 
      },
      '100%': { 
        transform: 'translateY(-150px) rotate(-90deg) scale(0.8)', 
        opacity: 0 
      },
    },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      move: 'move 1s ease-in-out infinite',
      smoke: 'smoke 2s ease-in-out infinite',
      write: 'write 1s ease-in-out infinite',
      delete: 'delete 0.5s ease-in-out infinite',
      check: 'check 1s ease-in-out infinite',
      'thumbs-up': 'thumbs-up 1s ease-in-out infinite',
      'edit-pencil': 'edit-pencil 1s ease-in-out infinite',
      send: 'send 1.5s ease-in-out infinite',
      rocket: 'rocket 2s ease-in-out infinite',

    },
  },
};
export const plugins = [tailwindcssAnimate];
