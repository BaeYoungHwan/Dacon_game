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
  it('모든 턴에서 기업 뉴스는 3~5개로 보장', () => {
    for (let t = 1; t <= 50; t++) {
      const { news } = progressTurn(t, allStocks)
      expect(news).not.toBeNull()
      expect(news.length).toBeGreaterThanOrEqual(3)
      expect(news.length).toBeLessThanOrEqual(5)
      news.forEach(n => expect(n.sector).not.toBe('전체'))
    }
  })

  it('기업 뉴스 결과는 라운드 내 ID 중복 없음', () => {
    const { news } = progressTurn(7, allStocks)
    const ids = news.map(n => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('같은 turn 호출은 결정적(같은 결과)', () => {
    const a = progressTurn(15, allStocks).news.map(n => n.id)
    const b = progressTurn(15, allStocks).news.map(n => n.id)
    expect(a).toEqual(b)
  })

  it('날짜 매칭 뉴스가 우선 포함됨 (turn=2→n01)', () => {
    const { news } = progressTurn(2, allStocks)
    expect(news.map(n => n.id)).toContain('n01')
  })

  it('turn=1(2025-05-29) → globalNews 존재 (sector=전체)', () => {
    const { globalNews } = progressTurn(1, allStocks)
    expect(globalNews).not.toBeNull()
    expect(globalNews.sector).toBe('전체')
  })

  it('newExchangeRate → 항상 null', () => {
    expect(progressTurn(1, allStocks).newExchangeRate).toBeNull()
    expect(progressTurn(25, allStocks).newExchangeRate).toBeNull()
  })
})
