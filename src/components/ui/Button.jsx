// TODO(신입): 공용 버튼 컴포넌트
// Props:
//   children   - 버튼 텍스트
//   onClick    - 클릭 핸들러
//   variant    - 'primary' | 'danger' | 'ghost' (기본: primary)
//   disabled   - boolean

export default function Button({ children, onClick, variant = 'primary', disabled = false }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    danger:  'bg-red-600 hover:bg-red-500 text-white',
    ghost:   'bg-gray-700 hover:bg-gray-600 text-white',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded font-bold transition-all duration-150 disabled:opacity-40 ${variants[variant]}`}
    >
      {children}
    </button>
  )
}
