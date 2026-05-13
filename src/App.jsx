import { useGameStore } from './store/gameStore'
import StartPage from './pages/StartPage'
import GamePage from './pages/GamePage'
import ResultPage from './pages/ResultPage'

// 페이지 전환: store의 page 값으로 조건부 렌더링 (react-router 불필요)
export default function App() {
  const page = useGameStore((state) => state.page)

  if (page === 'game') return <GamePage />
  if (page === 'result') return <ResultPage />
  return <StartPage />
}
