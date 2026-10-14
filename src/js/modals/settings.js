// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Settings modal renderer - keyboard layout selection
 */
(() => {
    if (!window.ModalManager) { console.error('ModalManager not available. Include modals/core.js first'); return; }
    function render() { const layouts = window.KeyboardUI?.getAvailableLayouts()||[]; const currentLayout = window.SettingsManager?.getKeyboardLayout()||'en-qwerty'; const layoutOptions = layouts.map(id=>{ const layout=window.KeyboardLayouts?.getLayout(id); const name=layout?.name||id; const selected=id===currentLayout?'selected':''; return `<option value="${id}" ${selected}>${name}</option>`; }).join(''); return `<div class="modal-section"><label class="modal-label" for="keyboard-layout-select">Keyboard Layout</label><select id="keyboard-layout-select" class="modal-select">${layoutOptions}</select></div>`; }
    function bind(_data, container) { const select = container.querySelector('#keyboard-layout-select'); if (select) select.addEventListener('change', e => window.SettingsManager?.applyKeyboardLayout(e.target.value, true)); }
    window.ModalManager.registerType('settings', { title: 'Keyboard Layout', render, bind });
})();
