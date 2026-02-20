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
                'midnight-deep': '#020617',
                'midnight-accent': '#1e293b',
                gold: '#d4af37',
                offWhite: '#faf9f6',
                darkGray: '#2d2d2d',
                softRose: '#f4e4e4',
                lightGold: '#f5e6c8',
            },
            fontFamily: {
                playfair: ['"Playfair Display"', 'serif'],
                serif: ['"Cormorant Garamond"', 'serif'],
                luxury: ['"Cormorant Garamond"', 'serif'],
                modern: ['Outfit', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
                sans: ['Outfit', 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
