// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Color Settings modal renderer
 */
(() => {
    if (!window.ModalManager) { console.error('ModalManager not available. Include modals/core.js first'); return; }
    const esc = window.AppUtils?.escapeHtml || (s => String(s ?? ''));
    function toHex(value) { if (!value) return null; const trimmed = value.trim(); if (trimmed.startsWith('#')) return trimmed; const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)$/i); if (rgbMatch) { const hex = [rgbMatch[1],rgbMatch[2],rgbMatch[3]].map(x=>Number(x).toString(16).padStart(2,'0')).join(''); return `#${hex}`; } return null; }
    function render(data) { const theme = esc(data?.theme||'dark'); const savedColors = window.ColorSettings?.getColors(data?.theme||'dark') || {}; const style = getComputedStyle(document.body); const getColor = varName => { const saved = savedColors[varName]; if (saved) return saved; const computed = style.getPropertyValue(varName); return toHex(computed) || '#000000'; }; return `<div class="modal-section"><p class="modal-label">Editing: <strong>${theme}</strong> theme</p><div class="color-group"><label class="color-row"><span>Background</span><input type="color" data-var="--bg" value="${getColor('--bg')}"></label><label class="color-row"><span>Text & Keys</span><input type="color" data-var="--accent" value="${getColor('--accent')}"></label><label class="color-row"><span>UI Text</span><input type="color" data-var="--text-default" value="${getColor('--text-default')}"></label><label class="color-row"><span>Error</span><input type="color" data-var="--error-text" value="${getColor('--error-text')}"></label></div><div class="color-actions"><button type="button" class="color-btn" id="color-reset">Reset</button><button type="button" class="color-btn color-btn-primary" id="color-save">Save</button></div></div>`; }
    function bind(data, container) { const theme = data?.theme||'dark'; const inputs = container.querySelectorAll('input[type="color"]'); inputs.forEach(input => input.addEventListener('input', () => { if (window.ColorSettings) window.ColorSettings.preview(input.dataset.var, input.value); })); const saveBtn = container.querySelector('#color-save'); if (saveBtn) saveBtn.addEventListener('click', () => { const colors = {}; inputs.forEach(input => colors[input.dataset.var] = input.value); if (window.ColorSettings) window.ColorSettings.save(theme, colors); window.ModalManager.hide(); }); const resetBtn = container.querySelector('#color-reset'); if (resetBtn) resetBtn.addEventListener('click', () => { if (window.ColorSettings) window.ColorSettings.reset(theme); window.ModalManager.hide(); }); }
    window.ModalManager.registerType('color-settings', { title: 'Color Settings', render, bind });
})();
