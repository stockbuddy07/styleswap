/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                midnight: '#1a1f3a',
                gold: '#d4af37',
                offWhite: '#faf9f6',
                darkGray: '#2d2d2d',
                softRose: '#f4e4e4',
                lightGold: '#f5e6c8',
            },
            fontFamily: {
                playfair: ['"Playfair Display"', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
