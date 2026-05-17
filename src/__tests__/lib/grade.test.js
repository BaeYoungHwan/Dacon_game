import { describe, it, expect } from 'vitest'
import { GRADES, getGrade, calcExcessPp } from '../../lib/grade.js'

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

describe('getGrade — 경계값', () => {
  it.each([
    [300,       '전설의 동학개미'],
    [200,       '전설의 동학개미'],
    [199.99,    '작전세력'],
    [50,        '작전세력'],
    [0,         '큰손'],
    [0.001,     '큰손'],
    [-0.001,    '슈퍼개미'],
    [-10,       '슈퍼개미'],
    [-10.001,   '개미'],
    [-Infinity, '개미'],
  ])('excessPp=%s → %s', (input, expected) => {
    expect(getGrade(input).label).toBe(expected)
  })

  it('반환 객체에 color·emoji 포함', () => {
    const g = getGrade(200)
    expect(g.color).toBeDefined()
    expect(g.emoji).toBeDefined()
  })

  it('GRADES 배열은 threshold 내림차순', () => {
    for (let i = 0; i < GRADES.length - 1; i++) {
      expect(GRADES[i].threshold).toBeGreaterThan(GRADES[i + 1].threshold)
    }
  })
})
