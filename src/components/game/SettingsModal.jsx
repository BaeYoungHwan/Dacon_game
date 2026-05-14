export default function SettingsModal({ onClose }) {
  const handleReset = () => {
    if (window.confirm('게임을 초기화하시겠습니까? 모든 진행 상황이 삭제됩니다.')) {
      localStorage.removeItem('k-stock-merchant')
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">설정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <button
          onClick={handleReset}
          className="w-full py-2 bg-red-700 hover:bg-red-600 rounded-lg text-sm font-bold transition-all duration-150"
        >
          게임 초기화
        </button>
      </div>
    </div>
  )
}
