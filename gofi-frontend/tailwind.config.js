const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    mode: 'jit',
    important: true,
    purge: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            backgroundColor: ['active', 'checked'],
            textColor: ['active', 'checked'],
            borderColor: ['active', 'checked'],
            fontWeight: ['hover', 'focus'],
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
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
    variants: {},
    plugins: [],
}
