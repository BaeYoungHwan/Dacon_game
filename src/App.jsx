import { useGameStore } from './store/gameStore'
import StartPage from './pages/StartPage'
import GamePage from './pages/GamePage'
import MarketPage from './pages/MarketPage'
import InfoMerchantPage from './pages/InfoMerchantPage'
import TechMerchantPage from './pages/TechMerchantPage'
import ResultPage from './pages/ResultPage'
import AudioController from './components/AudioController'

// 페이지 전환: store의 page 값으로 조건부 렌더링 (react-router 불필요)
// 흐름: start → main ↔ market / infoMerchant / techMerchant → result
export default function App() {
  const page = useGameStore((state) => state.page)

  return (
    <>
      <AudioController />
      {page === 'main'         && <GamePage />}
      {page === 'market'       && <MarketPage />}
      {page === 'infoMerchant' && <InfoMerchantPage />}
      {page === 'techMerchant' && <TechMerchantPage />}
      {page === 'result'       && <ResultPage />}
      {page === 'start'        && <StartPage />}
    </>
  )
}
