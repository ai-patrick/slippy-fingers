// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Session Summary modal renderer
 */
(() => {
    if (!window.ModalManager) { console.error('ModalManager not available. Include modals/core.js first'); return; }
    const esc = window.AppUtils?.escapeHtml || (s => String(s ?? ''));
    function formatKeyLabel(key) { if (!key) return 'Unknown'; switch (key) { case ' ': return 'Space'; case '\n': case 'Enter': return 'Enter'; case '\t': case 'Tab': return 'Tab'; case 'Backspace': return 'Backspace'; default: return esc(key); } }
    function renderMistakeList(mistakes) { if (!mistakes) return ''; const entries = Object.entries(mistakes).filter(([,c])=>c>0).sort((a,b)=>b[1]-a[1]); if (entries.length===0) return ''; const items = entries.map(([key,count]) => `<li><span class="mistake-key">${formatKeyLabel(key)}</span><span class="mistake-count">${count}</span></li>`).join(''); return `<div class="summary-mistakes"><h4>Mistyped characters</h4><ul class="mistake-list">${items}</ul></div>`; }

function renderWeakSpots(keystrokes) {
    if (!keystrokes || !Array.isArray(keystrokes)) return '';
    if (!window.SlippyProfile?.sessionWeakSpots) return '';
    const spots = window.SlippyProfile.sessionWeakSpots(keystrokes, 5);
    if (spots.length === 0) return '';
    const items = spots.map(s => {
        const a = formatKeyLabel(s.keys[0]);
        const b = formatKeyLabel(s.keys[1]);
        const avg = s.avgMs > 0 ? `${s.avgMs}ms` : '—';
        const err = s.errors > 0 ? ` (${s.errors} err)` : '';
        return `<li><span class="mistake-key">${esc(a)} → ${esc(b)}</span><span class="mistake-count">${esc(avg)}${esc(err)}</span></li>`;
    }).join('');
    return `<div class="summary-mistakes"><h4>Weakest key pairs</h4><ul class="mistake-list">${items}</ul></div>`;
}
    function render(data) { if (!data) return '<p>No session data</p>'; return `<div class="session-summary"><div class="summary-stats"><div class="summary-stat"><span class="summary-label">WPM</span><span class="summary-value">${Math.round(data.wpm||0)}</span></div><div class="summary-stat"><span class="summary-label">CPM</span><span class="summary-value">${Math.round(data.cpm||0)}</span></div><div class="summary-stat"><span class="summary-label">Accuracy</span><span class="summary-value">${(data.accuracy||0).toFixed(1)}%</span></div><div class="summary-stat"><span class="summary-label">Time</span><span class="summary-value">${window.AppUtils?.formatTime?.(data.duration||0)??'00:00'}</span></div></div>${data.totalErrors>0?`<div class="summary-errors"><h3>Errors: ${data.totalErrors}</h3><p>Total keystrokes: ${data.totalKeystrokes||0}</p>${renderMistakeList(data.mistakes)}</div>`:''}${renderWeakSpots(data.keystrokes)}</div>`; }
    function getTitle(data) { return data?.isCompleted ? 'Session Complete' : 'Session Paused'; }
    window.ModalManager.registerType('session-summary', { title: getTitle, render });
})();
