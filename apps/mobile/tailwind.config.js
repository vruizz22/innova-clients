module.exports = {
    content: [
        './App.{js,jsx,ts,tsx}',
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
        '../../SuperProfes-Design-System/**/*.html',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2F8DBA',
                success: '#3DAA72',
                warning: '#E8A33D',
                danger: '#D86060',
                canvas: '#F7F8FA',
            },
        },
    },
    plugins: [],
}
