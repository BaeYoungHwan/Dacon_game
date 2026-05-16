import { describe, it, expect } from "vitest"
import { calcMA, calcBollinger, calcMACD, calcOBV, getMaSignal, getBollingerSignal, getMacdSignal, getObvSignal, getRecentCloses } from "../../components/game/chartUtils.js"

describe("calcMA", () => {
  it("period=1 returns original", () => expect(calcMA([10,20,30],1)).toEqual([10,20,30]))
  it("index 0 = self (no nulls)", () => expect(calcMA([100,200],5)[0]).toBe(100))
  it("5-period average accurate", () => {
    const ma = calcMA([100,110,120,130,140,150], 5)
    expect(ma[4]).toBeCloseTo(120)
    expect(ma[5]).toBeCloseTo(130)
  })
  it("empty array returns empty", () => expect(calcMA([],5)).toEqual([]))
  it("no null values (expanding MA)", () => calcMA([100,200,300,400,500],20).forEach(v => expect(v).not.toBeNull()))
})

describe("calcBollinger", () => {
  it("single point -- upper=middle=lower", () => expect(calcBollinger([100],20)[0]).toEqual({upper:100,middle:100,lower:100}))
  it("identical prices -- zero band width", () => {
    const last = calcBollinger(Array(20).fill(100),20).at(-1)
    expect(last.upper).toBeCloseTo(100)
    expect(last.lower).toBeCloseTo(100)
  })
  it("with variance -- upper > middle > lower", () => {
    const closes = [100,120,80,140,60,160,90,110,130,100,120,80,140,60,160,90,110,130,100,120]
    const last = calcBollinger(closes,20).at(-1)
    expect(last.upper).toBeGreaterThan(last.middle)
    expect(last.middle).toBeGreaterThan(last.lower)
  })
})

describe("calcMACD", () => {
  it("25 points -- all null", () => calcMACD(Array(25).fill(100)).forEach(d => { expect(d.macd).toBeNull(); expect(d.signal).toBeNull() }))
  it("26+ points -- index 25 has macd", () => {
    const r = calcMACD(Array(35).fill(0).map((_,i) => 100+i*2))
    expect(r[25].macd).not.toBeNull()
    expect(r[24].macd).toBeNull()
  })
  it("histogram = macd - signal", () => {
    const closes = Array(50).fill(0).map((_,i) => 100+Math.sin(i)*10)
    calcMACD(closes).forEach(d => { if (d.macd!==null && d.signal!==null) expect(d.histogram).toBeCloseTo(d.macd-d.signal,8) })
  })
})

describe("calcOBV", () => {
  it("first bar = 0", () => expect(calcOBV([{close:100,volume:1000},{close:110,volume:1500}])[0]).toBe(0))
  it("up bar -- increases", () => expect(calcOBV([{close:100,volume:1000},{close:110,volume:1500}])[1]).toBe(1500))
  it("down bar -- decreases", () => expect(calcOBV([{close:100,volume:1000},{close:90,volume:1200}])[1]).toBe(-1200))
  it("same close -- unchanged", () => expect(calcOBV([{close:100,volume:1000},{close:100,volume:500}])[1]).toBe(0))
  it("output length = input length", () => expect(calcOBV(Array(10).fill({close:100,volume:500}))).toHaveLength(10))
})

describe("getMaSignal", () => {
  it("1개 데이터 → null", () => {
    expect(getMaSignal([100], [90])).toBeNull()
  })
  it("ma5 > ma20 → trend=bull", () => {
    const sig = getMaSignal([90, 100], [90, 95])
    expect(sig.trend).toBe("bull")
  })
  it("골든크로스 감지", () => {
    const ma5 =  [85, 100]
    const ma20 = [90,  95]
    const sig = getMaSignal(ma5, ma20)
    expect(sig.crossSignal).toContain("골든크로스")
  })
  it("데드크로스 감지", () => {
    const ma5 =  [95,  80]
    const ma20 = [90,  85]
    const sig = getMaSignal(ma5, ma20)
    expect(sig.crossSignal).toContain("데드크로스")
  })
})

describe("getBollingerSignal", () => {
  const band = [{ upper: 110, middle: 100, lower: 90 }]
  it("pctB > 0.9 → 과매수 신호", () => {
    const sig = getBollingerSignal(band, [109])
    expect(sig.bandSignal).toContain("과매수")
  })
  it("pctB < 0.1 → 과매도 신호", () => {
    const sig = getBollingerSignal(band, [91])
    expect(sig.bandSignal).toContain("과매도")
  })
  it("중간 구간 → bandSignal null", () => {
    const sig = getBollingerSignal(band, [100])
    expect(sig.bandSignal).toBeNull()
  })
})

describe("getMacdSignal", () => {
  it("macd > signal → trend=bull", () => {
    const data = [
      { macd: 3, signal: 4, histogram: -1 },
      { macd: 7, signal: 4, histogram: 3 },
    ]
    expect(getMacdSignal(data).trend).toBe("bull")
  })
  it("골든크로스 감지", () => {
    const data = [
      { macd: 2, signal: 5, histogram: -3 },
      { macd: 6, signal: 5, histogram: 1 },
    ]
    const sig = getMacdSignal(data)
    expect(sig.crossSignal).toContain("골든크로스")
  })
})

describe("getObvSignal", () => {
  it("데이터 2개 → null", () => {
    expect(getObvSignal([0, 100])).toBeNull()
  })
  it("상승 추세 → bull", () => {
    const sig = getObvSignal([0, 100, 200, 300, 400])
    expect(sig.trend).toBe("bull")
  })
  it("하락 추세 → bear", () => {
    const sig = getObvSignal([400, 300, 200, 100, 0])
    expect(sig.trend).toBe("bear")
  })
})

describe("getRecentCloses", () => {
  it("존재하지 않는 id → 빈 배열", () => {
    expect(getRecentCloses("INVALID_ID", 1, 8)).toEqual([])
  })
  it("turn=1, n=8 → length<=8, all numbers", () => {
    const closes = getRecentCloses("005930", 1, 8)
    expect(closes.length).toBeLessThanOrEqual(8)
    closes.forEach(v => expect(typeof v).toBe("number"))
  })
})

describe("getBollingerSignal — 제로 밴드 가드", () => {
  it("upper === lower (zero-width band) → pctB=0.5, bandSignal null", () => {
    const band = [{ upper: 100, middle: 100, lower: 100 }]
    const sig = getBollingerSignal(band, [100])
    expect(sig.pctB).toBe(0.5)
    expect(Number.isNaN(sig.pctB)).toBe(false)
    expect(sig.bandSignal).toBeNull()
  })
})
