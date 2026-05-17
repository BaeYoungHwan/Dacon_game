// 거래소·정보상·기술상·메인 공통 네비게이션 + 공유 버튼 톤
//
// 디자인 기준: GamePage "다음 주" 버튼 — 슬레이트 그라데이션 + 시안 border + 4모서리 L자 deco
//             + 평소 약한 outer/inset shadow + hover 시 진한 시안 글로우 + 라벨 풍선
//
// Export:
//   · IconButton     — w-16 h-16 정사각 아이콘 버튼 (외부에서도 사용 가능)
//   · LocationButton — 가로 라벨 버튼
//   · HelpIcon/SettingsIcon/HomeIcon/ExitIcon — Heroicons outline 톤 SVG
//   · TopRightNav    — 거래소·정보상·기술상 공용: 도움말/설정/메인 아이콘 3개
//   · BottomRightNav — 현재 페이지를 제외한 나머지 2곳 이동 (라벨 버튼)

import { useState } from 'react'
import SettingsModal from './SettingsModal'

// 페이지 키 ↔ 한글 라벨
const PAGE_LABELS = {
  market:       '거래소',
  infoMerchant: '정보상',
  techMerchant: '기술상',
}

// ─────────────────────────────────────────────────────────
// 공유 버튼 톤 — 네온 칩(아웃라인 캡슐)
//   · 본체: 완전 투명 (bg-transparent)
//   · 테두리: cyan-300 두꺼운 라인 (rounded-full)
//   · 평소: outer halo glow (blur 느낌의 외광 — box-shadow + ::after halo)
//   · hover: 안쪽이 cyan-400/20으로 차오르며 글로우 진해짐
//   · 텍스트/아이콘: cyan-100, 시안 드롭섀도우
// ─────────────────────────────────────────────────────────
const BTN_BASE =
  'relative group flex items-center justify-center ' +
  'bg-transparent hover:bg-cyan-400/20 ' +
  'border-2 border-cyan-300/80 hover:border-cyan-200 ' +
  'text-cyan-100 hover:text-white ' +
  'transition-all duration-200 focus:outline-none focus:ring-0 cursor-pointer'

const BTN_SHADOW_REST  = '0 0 18px rgba(34,211,238,0.35), inset 0 0 12px rgba(34,211,238,0.08)'
const BTN_SHADOW_HOVER = '0 0 32px rgba(34,211,238,0.7),  inset 0 0 20px rgba(34,211,238,0.25)'

// 외광 halo — 본체 뒤에서 부드럽게 번지는 시안 후광 (blur로 부드럽게)
// shape: 'round' (chip) | 'square' (rect button) — 모양에 맞춰 halo 라운드 통일
function NeonHalo({ shape = 'round' }) {
  const rounded = shape === 'round' ? 'rounded-full' : 'rounded-md'
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-0 ${rounded} pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-200`}
      style={{
        boxShadow: '0 0 20px 4px rgba(34,211,238,0.45)',
        filter: 'blur(6px)',
      }}
    />
  )
}

// 호버 라벨 풍선 — IconButton 아래 / 또는 외부에서 위치 조정 가능
function HoverLabel({ label, position = 'bottom' }) {
  const pos = position === 'bottom'
    ? 'top-full mt-2'
    : 'bottom-full mb-2'
  return (
    <span className={`absolute ${pos} left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-cyan-100 text-sm px-3 py-1 rounded-lg border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none font-mono tracking-wider`}>
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────
// IconButton — w-16 h-16 정사각 아이콘 버튼 (hover 라벨 풍선)
// 외부에서 직접 import 가능 (GamePage의 도움말/설정/종료 등)
// ─────────────────────────────────────────────────────────
export function IconButton({ icon, label, onClick, labelPosition = 'bottom' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ outline: 'none', boxShadow: BTN_SHADOW_REST }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = BTN_SHADOW_HOVER }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = BTN_SHADOW_REST }}
      className={`${BTN_BASE} w-14 h-14 rounded-full`}
    >
      <NeonHalo shape="round" />
      <span className="relative z-10 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">{icon}</span>
      <HoverLabel label={label} position={labelPosition} />
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// LocationButton — 라벨이 보이는 가로 버튼
// ─────────────────────────────────────────────────────────
export function LocationButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label}로 이동`}
      style={{ outline: 'none', boxShadow: BTN_SHADOW_REST }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = BTN_SHADOW_HOVER }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = BTN_SHADOW_REST }}
      className={`${BTN_BASE} px-6 h-20 rounded-md gap-3`}
    >
      <NeonHalo shape="square" />
      <span className="relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">{icon}</span>
      <span
        className="relative z-10 font-mono font-bold tracking-widest text-xl"
        style={{ textShadow: '0 0 10px rgba(34,211,238,0.85)' }}
      >
        {label}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// TopRightNav — 우상단 도움말/설정/메인 (거래소·정보상·기술상 공용)
// ─────────────────────────────────────────────────────────
export function TopRightNav({ onHelp, navigateTo }) {
  const [openSettings, setOpenSettings] = useState(false)
  return (
    <>
      {/* 칩 사이 halo 번짐 여유 */}
      <div className="absolute top-4 right-4 flex gap-3 z-10">
        <IconButton icon={<HelpIcon />}     label="도움말" onClick={onHelp} />
        <IconButton icon={<SettingsIcon />} label="설정"   onClick={() => setOpenSettings(true)} />
        <IconButton icon={<HomeIcon />}     label="메인"   onClick={() => navigateTo('main')} />
      </div>
      {openSettings && <SettingsModal onClose={() => setOpenSettings(false)} />}
    </>
  )
}

// ─────────────────────────────────────────────────────────
// BottomRightNav — 우하단 다른 페이지 2곳 이동 (현재 페이지 자동 제외)
// ─────────────────────────────────────────────────────────
export function BottomRightNav({ current, navigateTo }) {
  return (
    <div className="absolute bottom-5 right-5 flex gap-3 z-10">
      {current !== 'market' && (
        <LocationButton icon={<MarketIcon />} label="거래소" onClick={() => navigateTo('market')} />
      )}
      {current !== 'infoMerchant' && (
        <LocationButton icon={<InfoIcon />} label="정보상" onClick={() => navigateTo('infoMerchant')} />
      )}
      {current !== 'techMerchant' && (
        <LocationButton icon={<TechIcon />} label="기술상" onClick={() => navigateTo('techMerchant')} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// SVG 아이콘 (Heroicons outline 톤)
// ─────────────────────────────────────────────────────────
export function HelpIcon() {
  return (
    <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function SettingsIcon() {
  return (
    <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export function HomeIcon() {
  return (
    <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0L22.28 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

export function ExitIcon() {
  return (
    <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// 장소 아이콘 — 거래소(차트바) / 정보상(신문) / 기술상(CPU칩)
// LocationButton 좌측에 표시. w-8 h-8 (IconButton 아이콘보다 한 단계 큼)
// ─────────────────────────────────────────────────────────
export function MarketIcon() {
  return (
    <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

export function InfoIcon() {
  return (
    <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  )
}

export function TechIcon() {
  return (
    <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  )
}
