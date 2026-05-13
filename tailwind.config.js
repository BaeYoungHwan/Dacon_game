/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 한국 주식 컨벤션: 상승 빨강 / 하락 파랑
        rise: '#ef4444',
        fall: '#3b82f6',
      },
      transitionDuration: {
        fast: '150ms',
      },
    },
  },
  plugins: [],
}
