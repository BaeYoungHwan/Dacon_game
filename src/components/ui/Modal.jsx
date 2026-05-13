// TODO(신입): 공용 모달 컴포넌트
// Props:
//   isOpen    - boolean
//   onClose   - 닫기 핸들러
//   title     - 모달 제목
//   children  - 모달 내용

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
