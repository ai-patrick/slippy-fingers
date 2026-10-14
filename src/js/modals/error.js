// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Error modal renderer
 */
(() => {
    if (!window.ModalManager) { console.error('ModalManager not available. Include modals/core.js first'); return; }
    const esc = window.AppUtils?.escapeHtml || (s => String(s ?? ''));
    function render(data) { return `<div class="error-message"><p>${esc(data?.message||'An error occurred')}</p><button type="button" id="error-ok">OK</button></div>`; }
    function bind(_data, container) { const okBtn = container.querySelector('#error-ok'); if (okBtn) okBtn.addEventListener('click', () => window.ModalManager.hide()); }
    window.ModalManager.registerType('error', { title: 'Error', render, bind });
})();
