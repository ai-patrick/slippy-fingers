// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Stats manager - records sessions, renders keyboard heatmap
 */
(() => {
    if (!window.EventBus) { console.error('EventBus not available. Include events.js before stats.js'); return; }
    let lastSessionSummary = null;
    const STORAGE_KEY = 'slippy-sessions';

    async function recordSession(sessionData) {
        if (!sessionData) return; lastSessionSummary = { ...sessionData };
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const textMeta = window.App?.getTextMeta?.() || {};
            const payload = { text: sessionData.text || '', textId: textMeta.textId || '', textTitle: textMeta.textTitle || '', categoryId: textMeta.categoryId || '', mistakes: sessionData.mistakes || {}, wpm: sessionData.wpm || 0, cpm: sessionData.cpm || 0, accuracy: sessionData.accuracy || 100, duration: sessionData.duration || 0, startTime: sessionData.startTime || 0, endTime: sessionData.endTime || Date.now(), totalErrors: sessionData.totalErrors || 0, totalKeystrokes: sessionData.totalKeystrokes || 0 };
            stored.unshift(payload); if (stored.length > 100) stored.pop(); localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch (err) { console.warn('StatsManager: failed to save session:', err); }
    }
    function getSessionSummary() { return lastSessionSummary; }
    function getHeatmapColor(count) { if (!count || count <= 0) return 'rgba(0,0,0,0)'; if (count <= 2) return 'rgba(255,235,59,0.30)'; if (count <= 5) return 'rgba(255,152,0,0.50)'; if (count <= 9) return 'rgba(244,67,54,0.70)'; return 'rgba(183,28,28,0.90)'; }
    function getKeyElementsMap() { const map = new Map(); document.querySelectorAll('#keyboard .key').forEach(el => { const key = el.dataset?.key; if (!key) return; if (!map.has(key)) map.set(key, []); map.get(key).push(el); }); return map; }
    function renderHeatmap(mistakes) { if (!mistakes) return; const map = getKeyElementsMap(); map.forEach(els => els.forEach(el => el.style.removeProperty('--heatmap-color'))); const layout = window.KeyboardUI?.getCurrentLayout(); const keyCounts = new Map(); Object.entries(mistakes).forEach(([char, count]) => { if (!count) return; window.KeyUtils.keysForChar(char, layout).forEach(key => keyCounts.set(key, (keyCounts.get(key) || 0) + count)); }); keyCounts.forEach((count, key) => { const color = getHeatmapColor(count); map.get(key)?.forEach(el => el.style.setProperty('--heatmap-color', color)); }); }
    function clearHeatmap() { const map = getKeyElementsMap(); map.forEach(els => els.forEach(el => el.style.removeProperty('--heatmap-color'))); }
    window.EventBus.on('typing:start', () => clearHeatmap());
    window.EventBus.on('typing:complete', async data => { await recordSession(data); renderHeatmap(data?.mistakes || {}); });
    window.StatsManager = { recordSession, getSessionSummary, renderHeatmap, clearHeatmap };
})();
