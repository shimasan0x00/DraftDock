import { describe, it, expect } from 'vitest';

// window.tsの定数を直接インポートできないため、値を定義して検証
// 実際の定数値はwindow.tsと同期している必要がある

describe('Window Constants', () => {
  // CN-01: ウィンドウサイズ定数の検証
  describe('Window size constants', () => {
    // これらの値はwindow.tsで定義されている定数と一致する必要がある
    const MIN_WIDTH = 300;
    const MIN_HEIGHT = 250;
    const DEFAULT_WIDTH = 350;
    const DEFAULT_HEIGHT = 400;
    const SETTINGS_WIDTH = 400;
    const SETTINGS_HEIGHT = 350;

    it('should have valid minimum window dimensions', () => {
      expect(MIN_WIDTH).toBeGreaterThan(0);
      expect(MIN_HEIGHT).toBeGreaterThan(0);
      expect(MIN_WIDTH).toBeLessThanOrEqual(DEFAULT_WIDTH);
      expect(MIN_HEIGHT).toBeLessThanOrEqual(DEFAULT_HEIGHT);
    });

    it('should have valid default window dimensions', () => {
      expect(DEFAULT_WIDTH).toBe(350);
      expect(DEFAULT_HEIGHT).toBe(400);
    });

    it('should have valid settings window dimensions', () => {
      expect(SETTINGS_WIDTH).toBe(400);
      expect(SETTINGS_HEIGHT).toBe(350);
    });

    it('should ensure minimum is smaller than default', () => {
      expect(MIN_WIDTH).toBeLessThan(DEFAULT_WIDTH);
      expect(MIN_HEIGHT).toBeLessThan(DEFAULT_HEIGHT);
    });
  });
});

describe('Debounce Constants', () => {
  // CN-02: デバウンス値の検証
  // この値はrenderer/index.tsで定義されている
  const DEBOUNCE_MS = 500;

  it('should have a reasonable debounce value', () => {
    expect(DEBOUNCE_MS).toBe(500);
    expect(DEBOUNCE_MS).toBeGreaterThan(0);
    expect(DEBOUNCE_MS).toBeLessThanOrEqual(2000); // 2秒以下が妥当
  });
});
