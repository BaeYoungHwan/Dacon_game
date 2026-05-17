import { describe, it, expect } from 'vitest'
import { GRADES, getGrade, calcExcessPp, KOSPI_CHART_RETURN } from '../../lib/grade.js'

describe('calcExcessPp', () => {
  it('양수 초과수익률 계산', () => {
    expect(calcExcessPp(1.5, 0.5)).toBe(100)
  })
  it('음수 초과수익률 계산', () => {
    expect(calcExcessPp(0.5, 1.5)).toBe(-100)
  })
  it('동일 수익률 → 0', () => {
    expect(calcExcessPp(0.3, 0.3)).toBeCloseTo(0)
  })
})

describe('KOSPI_CHART_RETURN', () => {
  it('실제 kospi_closes 기반 약 177.9%', () => {
    expect(KOSPI_CHART_RETURN).toBeGreaterThan(1.7)
    expect(KOSPI_CHART_RETURN).toBeLessThan(1.85)
  })
})

describe('getGrade — 6단계 경계값', () => {
  it.each([
    // 전설의 동학개미: excessPp >= 100
    [206,        '전설의 동학개미'],
    [100,        '전설의 동학개미'],
    // 슈퍼개미: 30 <= excessPp < 100
    [99.99,      '슈퍼개미'],
    [30,         '슈퍼개미'],
    // 스마트개미: 0 <= excessPp < 30
    [29.99,      '스마트개미'],
    [0,          '스마트개미'],
    // 개미: -60 <= excessPp < 0
    [-0.001,     '개미'],
    [-60,        '개미'],
    // 흑우: -120 <= excessPp < -60
    [-60.001,    '흑우'],
    [-120,       '흑우'],
    // 벼락거지: excessPp < -120
    [-120.001,   '벼락거지'],
    [-177.9,     '벼락거지'],
    [-Infinity,  '벼락거지'],
  ])('excessPp=%s → %s', (input, expected) => {
    expect(getGrade(input).label).toBe(expected)
  })

  it('반환 객체에 color·emoji·comment·titleColor·borderColor·glowColor 포함', () => {
    const g = getGrade(200)
    expect(g.color).toBeDefined()
    expect(g.emoji).toBeDefined()
    expect(g.comment).toBeDefined()
    expect(g.titleColor).toBeDefined()
    expect(g.borderColor).toBeDefined()
    expect(g.glowColor).toBeDefined()
  })

  it('GRADES 배열 6개', () => {
    expect(GRADES.length).toBe(6)
  })

  it('GRADES 배열은 threshold 내림차순', () => {
    for (let i = 0; i < GRADES.length - 1; i++) {
      expect(GRADES[i].threshold).toBeGreaterThan(GRADES[i + 1].threshold)
    }
  })

  it('현금 보유(수익률 0%) 시 벼락거지', () => {
    // 현금만 보유: myReturn=0, kospiReturn≈1.779 → excessPp ≈ -177.9
    const excessPp = calcExcessPp(0, KOSPI_CHART_RETURN)
    expect(getGrade(excessPp).label).toBe('벼락거지')
  })
})
