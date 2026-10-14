// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Settings Manager - manages preferences, persists to localStorage
 */
(() => {
    let currentTheme = 'dark', isZenMode = false, isKeyboardVisible = true, isStatsBarVisible = true, isStrictMode = false, currentKeyboardLayout = 'en-qwerty', textZoom = 1.0;
    const ZOOM_MIN = 0.5, ZOOM_MAX = 2.0, ZOOM_STEP = 0.1;
    const getEl = id => document.getElementById(id);
    const ICON = { moon: `<svg width="16" height="16"><use href="#icon-moon"/></svg>`, sun: `<svg width="16" height="16"><use href="#icon-sun"/></svg>`, scan: `<svg width="16" height="16"><use href="#icon-scan"/></svg>`, crosshair: `<svg width="16" height="16"><use href="#icon-crosshair"/></svg>`, circle: `<svg width="16" height="16"><use href="#icon-circle"/></svg>` };
    const STORAGE_KEY = 'slippy-settings';

    function persistSetting(key, value) { try { const settings = loadSync(); settings[key] = value; localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (err) { console.warn(`Failed to persist ${key}:`, err); } }
    function loadSync() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
    function setThemeToggleIcon(theme) { const btn = getEl('theme-toggle'); if (!btn) return; btn.innerHTML = theme === 'dark' ? ICON.moon : ICON.sun; btn.setAttribute('aria-label', 'Toggle theme'); btn.setAttribute('title', 'Toggle theme'); }
    function setZenToggleState(enabled) { const btn = getEl('zen-toggle'); if (!btn) return; btn.setAttribute('aria-pressed', enabled ? 'true' : 'false'); btn.innerHTML = ICON.scan; btn.setAttribute('title', enabled ? 'Exit Zen mode (Ctrl+Alt+Z)' : 'Enter Zen mode (Ctrl+Alt+Z)'); btn.setAttribute('aria-label', enabled ? 'Exit Zen mode' : 'Enter Zen mode'); }
    function setStrictModeToggleState(enabled) { const btn = getEl('strict-mode-toggle'); if (!btn) return; btn.setAttribute('aria-pressed', enabled ? 'true' : 'false'); btn.innerHTML = enabled ? ICON.crosshair : ICON.circle; btn.setAttribute('title', enabled ? 'Strict mode ON (requires backspace)' : 'Cheat mode ON (direct correction)'); btn.setAttribute('aria-label', enabled ? 'Disable strict mode' : 'Enable strict mode'); }
    function applyTheme(theme, persist = true) { currentTheme = theme === 'light' ? 'light' : 'dark'; const body = document.body; const app = getEl('app'); body.classList.remove('theme-dark','theme-light'); app?.classList.remove('theme-dark','theme-light'); body.classList.add(`theme-${currentTheme}`); app?.classList.add(`theme-${currentTheme}`); const themeLink = getEl('theme-css'); if (themeLink) themeLink.setAttribute('href', `styles/theme-${currentTheme}.css`); setThemeToggleIcon(currentTheme); if (persist) persistSetting('theme', currentTheme); }
    function toggleTheme() { applyTheme(currentTheme === 'dark' ? 'light' : 'dark'); }
    function applyZenMode(enabled, persist = true) { isZenMode = Boolean(enabled); const body = document.body; const app = getEl('app'); body?.classList.toggle('zen-mode', isZenMode); app?.classList.toggle('zen-mode', isZenMode); setZenToggleState(isZenMode); if (!isZenMode) { getEl('keyboard-section')?.classList.toggle('hidden', !isKeyboardVisible); getEl('stats-bar')?.classList.toggle('hidden', !isStatsBarVisible); } window.EventBus?.emit('app:zen-mode', { enabled: isZenMode }); if (persist) persistSetting('zenMode', isZenMode); }
    function toggleZenMode() { applyZenMode(!isZenMode); }
    function applyKeyboardVisibility(visible, persist = true) { isKeyboardVisible = Boolean(visible); getEl('keyboard-section')?.classList.toggle('hidden', !isKeyboardVisible); if (persist) persistSetting('showKeyboard', isKeyboardVisible); }
    function toggleKeyboard() { applyKeyboardVisibility(!isKeyboardVisible); }
    function applyStatsBarVisibility(visible, persist = true) { isStatsBarVisible = Boolean(visible); getEl('stats-bar')?.classList.toggle('hidden', !isStatsBarVisible); if (persist) persistSetting('showStatsBar', isStatsBarVisible); }
    function toggleStatsBar() { applyStatsBarVisibility(!isStatsBarVisible); }
    function applyStrictMode(enabled, persist = true) { isStrictMode = Boolean(enabled); setStrictModeToggleState(isStrictMode); if (window.TypingEngine?.setStrictMode) window.TypingEngine.setStrictMode(isStrictMode); window.EventBus?.emit('app:strict-mode', { enabled: isStrictMode }); if (persist) persistSetting('strictMode', isStrictMode); }
    function toggleStrictMode() { applyStrictMode(!isStrictMode); }
    function applyKeyboardLayout(layoutId, persist = true) { if (!window.KeyboardUI?.setLayout(layoutId)) return false; currentKeyboardLayout = layoutId; if (persist) persistSetting('keyboardLayout', layoutId); return true; }
    function applyTextZoom(level, persist = true) { textZoom = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level)) * 10) / 10; const display = getEl('text-display'); const input = getEl('text-input'); if (display) display.style.setProperty('--text-zoom', textZoom); if (input) input.style.setProperty('--text-zoom', textZoom); if (persist) persistSetting('textZoom', textZoom); }
    function zoomIn() { applyTextZoom(textZoom + ZOOM_STEP); }
    function zoomOut() { applyTextZoom(textZoom - ZOOM_STEP); }
    function resetZoom() { applyTextZoom(1.0); }
    async function load() { const defaults = { theme: 'dark', zenMode: false, showKeyboard: true, showStatsBar: true, strictMode: true, keyboardLayout: 'en-qwerty', textZoom: 1.0 }; try { const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); return { ...defaults, ...stored }; } catch (err) { console.warn('Failed to load settings:', err); return defaults; } }
    window.SettingsManager = { load, applyTheme, toggleTheme, applyZenMode, toggleZenMode, applyKeyboardVisibility, toggleKeyboard, applyStatsBarVisibility, toggleStatsBar, applyStrictMode, toggleStrictMode, applyKeyboardLayout, applyTextZoom, zoomIn, zoomOut, resetZoom, getTheme: () => currentTheme, isZenMode: () => isZenMode, isKeyboardVisible: () => isKeyboardVisible, isStatsBarVisible: () => isStatsBarVisible, isStrictMode: () => isStrictMode, getKeyboardLayout: () => currentKeyboardLayout, getTextZoom: () => textZoom };
})();
