"""
pykrx로 코스피 실제 주봉 데이터 수집
기간: 2025-05-29 ~ 2026-05-07 (목요일 기준, 50주)
출력: src/data/stockData.json
"""

import json
import time
from pathlib import Path
from pykrx import stock

DATES = [
    "20250529", "20250605", "20250612", "20250619", "20250626",
    "20250703", "20250710", "20250717", "20250724", "20250731",
    "20250807", "20250814", "20250821", "20250828", "20250904",
    "20250911", "20250918", "20250925", "20251002",
    "20251008",
    "20251016", "20251023", "20251030", "20251106", "20251113",
    "20251120", "20251127", "20251204", "20251211", "20251218",
    "20251224",
    "20251231",
    "20260108", "20260115", "20260122", "20260129",
    "20260205", "20260212", "20260219", "20260226",
    "20260305", "20260312", "20260319", "20260326",
    "20260402", "20260409", "20260416", "20260423", "20260430",
    "20260507",
]

# 13개 pregame 날짜 — 목요일 기준, 차트 배경 전용 (게임 로직 미사용)
PREGAME_DATES = [
    "20250227", "20250306", "20250313", "20250320", "20250327",
    "20250403", "20250410", "20250417", "20250424",
    "20250501",  # 근로자의날(공휴일) → _get_row fallback으로 전일 자동 처리
    "20250508", "20250515", "20250522",
]

TICKERS = {
    "005930": ("삼성전자",           "반도체",        "stock_01"),
    "006400": ("삼성SDI",            "2차전지",       "stock_02"),
    "051910": ("LG화학",             "화학",          "stock_03"),
    "000270": ("기아",               "자동차",        "stock_04"),
    "068270": ("셀트리온",           "바이오",        "stock_05"),
    "055550": ("신한지주",           "금융",          "stock_06"),
    "294870": ("서울보증보험",       "보험",          "stock_07"),
    "035720": ("카카오",             "인터넷",        "stock_08"),
    "042660": ("한화오션",           "조선",          "stock_09"),
    "012450": ("한화에어로스페이스", "방산",          "stock_10"),
    "000720": ("현대건설",           "건설",          "stock_11"),
    "034020": ("두산에너빌리티",     "에너지/원전",   "stock_12"),
    "352820": ("HYBE",               "엔터",          "stock_13"),
    "263750": ("펄어비스",           "게임",          "stock_14"),
    "054540": ("에스트래픽",         "교통/모빌리티", "stock_15"),
    "030200": ("KT",                 "통신",          "stock_16"),
    "005490": ("포스코홀딩스",       "철강/소재",     "stock_17"),
    "139480": ("이마트",             "유통",          "stock_18"),
    "003490": ("대한항공",           "항공",          "stock_19"),
    "097950": ("CJ제일제당",         "식품",          "stock_20"),
    "252670": ("KODEX 200선물인버스2X", "인버스",     "stock_inv"),
}

COLLECT_START = "20250101"
COLLECT_END   = "20260531"
KOSPI200_ETF  = "069500"


def _get_row(df, date_str):
    if df is None or df.empty:
        return None, None
    sorted_idx = list(df.index)
    if date_str in df.index:
        return df.loc[date_str], date_str
    prev = [d for d in sorted_idx if d < date_str]
    if prev:
        return df.loc[prev[-1]], prev[-1]
    return None, None


def fetch_ohlcv(ticker):
    df = stock.get_market_ohlcv_by_date(COLLECT_START, COLLECT_END, ticker)
    if df.empty:
        print(f"  [경고] {ticker}: 데이터 없음")
        return {}
    df.index = df.index.strftime("%Y%m%d")
    result = {}
    for date_str in DATES:
        row, used = _get_row(df, date_str)
        if row is None:
            print(f"  [경고] {ticker} {date_str}: 없음, 0으로 채움")
            result[date_str] = {"open": 0, "high": 0, "low": 0, "close": 0, "volume": 0}
            continue
        if used != date_str:
            print(f"  [대체] {ticker} {date_str} -> {used}")
        result[date_str] = {
            "open":   int(row["시가"]),
            "high":   int(row["고가"]),
            "low":    int(row["저가"]),
            "close":  int(row["종가"]),
            "volume": int(row["거래량"]),
        }
    return result


def _returns_from_closes(closes):
    returns = [0.0]
    for i in range(1, len(closes)):
        prev = closes[i - 1]
        pct = (closes[i] - prev) / prev * 100 if prev != 0 else 0.0
        returns.append(round(pct, 2))
    return returns


def fetch_kospi_returns(dates, fallback_ohlcv=None):
    # KOSPI 지수 직접 수집 시도 (3회)
    for attempt in range(3):
        try:
            df = stock.get_index_ohlcv_by_date(COLLECT_START, COLLECT_END, "1001")
            if not df.empty:
                df.index = df.index.strftime("%Y%m%d")
                closes = []
                for d in dates:
                    row, _ = _get_row(df, d)
                    closes.append(float(row["종가"]) if row is not None else 0.0)
                print("  -> KOSPI 지수 API 성공")
                return _returns_from_closes(closes)
        except Exception as e:
            print(f"  [재시도 {attempt+1}/3] KOSPI API 오류: {e}")
            time.sleep(2)

    # KODEX 200 ETF(069500) 대체
    print("  [대체] KOSPI API 실패 -> KODEX 200 ETF(069500) 사용")
    if fallback_ohlcv and KOSPI200_ETF in fallback_ohlcv:
        omap = fallback_ohlcv[KOSPI200_ETF]
        closes = [float(omap.get(d, {}).get("close", 0)) for d in dates]
        print("  -> KODEX 200 대체 완료 (KOSPI 직접 수집 아님)")
        return _returns_from_closes(closes)

    print("  [경고] KOSPI 0.0으로 채움 - 수동 보정 필요")
    return [0.0] * len(dates)


def build_json(all_ohlcv, kospi_returns, pregame_kospi_returns):
    meta_dates = [f"{d[:4]}-{d[4:6]}-{d[6:]}" for d in DATES]
    meta_pregame_dates = [f"{d[:4]}-{d[4:6]}-{d[6:]}" for d in PREGAME_DATES]
    empty = {"open": 0, "high": 0, "low": 0, "close": 0, "volume": 0}
    stocks_list = []
    for ticker, (name, sector, sid) in TICKERS.items():
        omap = all_ohlcv.get(ticker, {})
        stocks_list.append({
            "id":             sid,
            "realTicker":     ticker,
            "name":           name,
            "sector":         sector,
            "pregame_prices": [omap.get(d, empty) for d in PREGAME_DATES],
            "prices":         [omap.get(d, empty) for d in DATES],
            "news":           [],
        })
    return {
        "meta":         {"rounds": 50, "dates": meta_dates, "pregame_dates": meta_pregame_dates},
        "kospi":         kospi_returns,
        "pregame_kospi": pregame_kospi_returns,
        "stocks":        stocks_list,
        "globalNews":    [],
    }


def verify(data):
    errors = []
    if len(data["meta"]["dates"]) != 50:
        errors.append(f"dates 길이 {len(data['meta']['dates'])} (50 필요)")
    if len(data["kospi"]) != 50:
        errors.append(f"kospi 길이 {len(data['kospi'])} (50 필요)")
    for s in data["stocks"]:
        if len(s["prices"]) != 50:
            errors.append(f"{s['name']}: prices={len(s['prices'])}")
        if len(s["pregame_prices"]) != 13:
            errors.append(f"{s['name']}: pregame_prices={len(s['pregame_prices'])} (13 필요)")
        zeros = [i + 1 for i, p in enumerate(s["prices"]) if p["close"] == 0]
        if zeros:
            errors.append(f"{s['name']}: close=0 라운드 {zeros}")
    if errors:
        print("\n[검증 경고]")
        for e in errors:
            print(f"  !! {e}")
    else:
        print("\n[검증 통과] 모든 종목 50라운드 정상")


def main():
    print("=== 주봉 데이터 수집 시작 ===")
    print(f"기간: {COLLECT_START} ~ {COLLECT_END}")
    print(f"종목: {len(TICKERS)}개 | 라운드: {len(DATES)}주\n")

    all_ohlcv = {}
    for i, (ticker, (name, _, __)) in enumerate(TICKERS.items(), 1):
        print(f"[{i:02d}/{len(TICKERS)}] {name} ({ticker})")
        all_ohlcv[ticker] = fetch_ohlcv(ticker)
        time.sleep(0.3)

    print("\n[KOSPI] 수집 중...")
    kospi_returns = fetch_kospi_returns(DATES, fallback_ohlcv=all_ohlcv)
    print(f"  -> {len(kospi_returns)}개 완료")


    print("[PREGAME KOSPI] 수집 중...")
    pregame_kospi = fetch_kospi_returns(PREGAME_DATES, fallback_ohlcv=all_ohlcv)
    print(f"  -> {len(pregame_kospi)}개 완료")
    data = build_json(all_ohlcv, kospi_returns, pregame_kospi)

    out_path = Path(__file__).parent.parent / "src" / "data" / "stockData.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n=== 저장: {out_path} ===")
    print(f"  stocks: {len(data['stocks'])}개")
    print(f"  rounds: {len(data['meta']['dates'])}개")
    verify(data)


if __name__ == "__main__":
    main()
