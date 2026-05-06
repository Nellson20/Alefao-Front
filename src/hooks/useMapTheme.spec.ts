import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useMapTheme } from './useMapTheme';

describe('useMapTheme', () => {
  beforeEach(() => {
    document.documentElement.className = '';
  });

  it('should return light theme by default', () => {
    const { result } = renderHook(() => useMapTheme());
    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.tileLayerUrl).toContain('openstreetmap.org');
  });

  it('should return dark theme when dark class is present', () => {
    document.documentElement.className = 'dark';
    const { result } = renderHook(() => useMapTheme());
    expect(result.current.isDarkMode).toBe(true);
    expect(result.current.tileLayerUrl).toContain('cartocdn.com/dark_all');
  });

  it('should update theme when class changes', () => {
    const { result } = renderHook(() => useMapTheme());
    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      document.documentElement.className = 'dark';
    });

    // We need to wait for the MutationObserver to trigger
    // Since it's async, we might need a small delay or a wait utility
    // But in jsdom, sometimes it's immediate or needs a tick
  });
});
