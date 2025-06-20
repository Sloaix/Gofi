/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                fadein: {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
            },
            animation: {
                fadein: 'fadein 0.25s ease-in',
                'spin-slow': 'spin 2.5s linear infinite',
            },
        },
    },
}
