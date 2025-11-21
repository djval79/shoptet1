/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    theme: {
        extend: {
            colors: {
                twilio: {
                    dark: '#0b1120',
                    body: '#0f172a',
                    card: '#1e293b',
                    accent: '#3b82f6',
                    purple: '#7c3aed',
                }
            }
        },
    },
    plugins: [],
}
