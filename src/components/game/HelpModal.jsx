export default function HelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">게임 방법</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <div className="text-sm text-gray-300 space-y-3">
          <section>
            <h3 className="text-white font-bold mb-1">📈 목표</h3>
            <p>50턴 안에 초기 자금 1,000만원을 최대한 불리세요!</p>
          </section>
          <section>
            <h3 className="text-white font-bold mb-1">🏪 장소 이동</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li><b>거래소</b> — 주식을 사고 팔 수 있어요.</li>
              <li><b>정보상</b> — 국제뉴스와 기업뉴스를 확인하세요.</li>
              <li><b>기술상</b> — 차트 지표와 히든 종목을 구매하세요. (10턴 이후 해금)</li>
            </ul>
          </section>
          <section>
            <h3 className="text-white font-bold mb-1">⏱ 턴 진행</h3>
            <p>메인 화면에서 '다음 턴' 버튼을 눌러 시간을 진행하세요. 매 턴마다 주가가 변동됩니다.</p>
          </section>
          <section>
            <h3 className="text-white font-bold mb-1">🏆 최종 평가</h3>
            <ul className="space-y-0.5">
              <li>2배 이상 — 레전드</li>
              <li>1.5배 이상 — 마스터</li>
              <li>1.2배 이상 — 수익</li>
              <li>1배 이상 — 본전</li>
              <li>1배 미만 — 손실</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
