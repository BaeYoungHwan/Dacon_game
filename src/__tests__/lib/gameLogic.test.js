import { describe, it, expect } from 'vitest'
import { progressTurn } from '../../lib/gameLogic.js'
import allStocks from '../../data/stocks.json'

// 22개 전체 종목 사용 (실제 게임과 동일)
const STOCK_IDS = allStocks.map(s => s.id)

describe('progressTurn — 가격 계산', () => {
  it('turn=1 → 모든 종목 id에 대해 양수 price 존재', () => {
    const { newPrices } = progressTurn(1, allStocks)
    STOCK_IDS.forEach(id => {
      expect(newPrices[id]).toBeGreaterThan(0)
    })
  })

  it('turn=1 삼성전자 종가 = 56100', () => {
    const { newPrices } = progressTurn(1, allStocks)
    expect(newPrices['005930']).toBe(56100)
  })

  it('turn=51 (범위 초과) → 빈 newPrices, 크래시 없음', () => {
    const result = progressTurn(51, allStocks)
    expect(result).toBeDefined()
    expect(Object.keys(result.newPrices).length).toBe(0)
  })

  it('stockId가 없는 종목은 newPrices에 포함되지 않음', () => {
    const { newPrices } = progressTurn(1, [{ id: 'INVALID' }])
    expect('INVALID' in newPrices).toBe(false)
  })
})

describe('progressTurn — KOSPI 계산', () => {
  it('turn=1 → kospi[0]=0 → newKospi = 2600', () => {
    const { newKospi } = progressTurn(1, allStocks)
    expect(newKospi).toBe(2600)
  })

  it('turn=2 → kospi[1]=4.24 → newKospi = 2710', () => {
    const { newKospi } = progressTurn(2, allStocks)
    expect(newKospi).toBe(2710)
  })

  it('모든 turn에서 newKospi는 양수 정수', () => {
    const { newKospi } = progressTurn(10, allStocks)
    expect(newKospi).toBeGreaterThan(0)
    expect(Number.isInteger(newKospi)).toBe(true)
  })
})

describe('progressTurn — 뉴스 처리', () => {
  it('turn=1(2025-05-29) → 전체 뉴스만 있어 news=null, globalNews 존재', () => {
    const { news, globalNews } = progressTurn(1, allStocks)
    expect(news).toBeNull()
    expect(globalNews).not.toBeNull()
    expect(globalNews.sector).toBe('전체')
  })

  it('turn=2(2025-06-05) → 기업 뉴스 존재, sector!=="전체"', () => {
    const { news } = progressTurn(2, allStocks)
    expect(news).not.toBeNull()
    expect(Array.isArray(news)).toBe(true)
    news.forEach(n => expect(n.sector).not.toBe('전체'))
  })

  it('turn=2 → globalNews null (해당 날짜 전체 뉴스 없음)', () => {
    const { globalNews } = progressTurn(2, allStocks)
    expect(globalNews).toBeNull()
  })

  it('newExchangeRate → 항상 null', () => {
    expect(progressTurn(1, allStocks).newExchangeRate).toBeNull()
    expect(progressTurn(25, allStocks).newExchangeRate).toBeNull()
  })
})
