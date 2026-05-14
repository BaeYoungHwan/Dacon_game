import { useGameStore } from './store/gameStore'
import StartPage from './pages/StartPage'
import GamePage from './pages/GamePage'
import MarketPage from './pages/MarketPage'
import InfoMerchantPage from './pages/InfoMerchantPage'
import TechMerchantPage from './pages/TechMerchantPage'
import ResultPage from './pages/ResultPage'

// 페이지 전환: store의 page 값으로 조건부 렌더링 (react-router 불필요)
// 흐름: start → main ↔ market / infoMerchant / techMerchant → result
export default function App() {
  const page = useGameStore((state) => state.page)

  if (page === 'main') return <GamePage />
  if (page === 'market') return <MarketPage />
  if (page === 'infoMerchant') return <InfoMerchantPage />
  if (page === 'techMerchant') return <TechMerchantPage />
  if (page === 'result') return <ResultPage />
  return <StartPage />
}
