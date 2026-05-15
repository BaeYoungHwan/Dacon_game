import { useAudioStore } from '../../store/audioStore'

export default function SettingsModal({ onClose }) {
  const { muted, volume, toggleMuted, setVolume, sfxVolume, setSfxVolume } = useAudioStore()

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

        {/* 배경음악 제어 */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">배경음악</span>
            <button
              onClick={toggleMuted}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all duration-150 ${
                muted
                  ? 'bg-gray-600 text-gray-400'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {muted ? '꺼짐' : '켜짐'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 w-8 text-center">
              {muted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              disabled={muted}
              className="flex-1 accent-blue-500 disabled:opacity-40"
            />
            <span className="text-xs text-gray-400 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>


        {/* 효과음 제어 */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300 w-14">효과음</span>
            <span className="text-sm text-gray-400 w-8 text-center">
              {sfxVolume === 0 ? '🔇' : sfxVolume > 0.5 ? '🔊' : '🔉'}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(Number(e.target.value))}
              disabled={muted}
              className="flex-1 accent-blue-500 disabled:opacity-40"
            />
            <span className="text-xs text-gray-400 w-8 text-right">
              {Math.round(sfxVolume * 100)}%
            </span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={handleReset}
            className="w-full py-2 bg-red-700 hover:bg-red-600 rounded-lg text-sm font-bold transition-all duration-150"
          >
            게임 초기화
          </button>
        </div>
      </div>
    </div>
  )
}
