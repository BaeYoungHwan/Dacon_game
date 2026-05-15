import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import StartPage from './pages/StartPage'
import GamePage from './pages/GamePage'
import MarketPage from './pages/MarketPage'
import InfoMerchantPage from './pages/InfoMerchantPage'
import TechMerchantPage from './pages/TechMerchantPage'
import ResultPage from './pages/ResultPage'
import AudioController from './components/AudioController'
import IntroScene from './components/game/IntroScene'
import { playSfx } from './lib/audioManager'

// 페이지 전환: store의 page 값으로 조건부 렌더링 (react-router 불필요)
// 흐름: start → main ↔ market / infoMerchant / techMerchant → result
export default function App() {
  const page = useGameStore((state) => state.page)

  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest('button:not([disabled])')) playSfx('click')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <>
      <AudioController />
      {page === 'intro'        && <IntroScene />}
      {page === 'main'         && <GamePage />}
      {page === 'market'       && <MarketPage />}
      {page === 'infoMerchant' && <InfoMerchantPage />}
      {page === 'techMerchant' && <TechMerchantPage />}
      {page === 'result'       && <ResultPage />}
      {page === 'start'        && <StartPage />}
    </>
  )
}