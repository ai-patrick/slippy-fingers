// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Modal Core - base infrastructure for modal rendering and lifecycle
 */
(() => {
    if (!window.EventBus) { console.error('EventBus not available. Include events.js before modals/core.js'); return; }
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');
    const renderers = {};
    function registerType(type, renderer) { renderers[type] = renderer; }
    function show(type, data) { if (!modalOverlay || !modalContent) return; const renderer = renderers[type]; if (!renderer) { console.warn(`Unknown modal type: ${type}`); modalContent.innerHTML = '<p>No content available</p>'; modalOverlay.classList.remove('modal-hidden'); return; } if (modalTitle) modalTitle.textContent = typeof renderer.title === 'function' ? renderer.title(data) : renderer.title; modalContent.innerHTML = renderer.render(data); modalOverlay.classList.remove('modal-hidden'); if (renderer.bind) renderer.bind(data, modalContent); }
    function hide() { if (modalOverlay) { modalOverlay.classList.add('modal-hidden'); if (window.ColorSettings?.clearPreview) window.ColorSettings.clearPreview(); window.EventBus.emit('modal:closed'); } }
    function isVisible() { return modalOverlay && !modalOverlay.classList.contains('modal-hidden'); }
    function confirm(options) { const esc = window.AppUtils?.escapeHtml || (s => String(s ?? '')); const { title = 'Confirm', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel' } = options; return new Promise(resolve => { if (modalTitle) modalTitle.textContent = title; modalContent.innerHTML = `<div class="confirm-dialog"><p class="confirm-message">${esc(message)}</p><div class="confirm-actions"><button type="button" class="btn-secondary" data-action="cancel">${esc(cancelText)}</button><button type="button" class="btn-danger" data-action="confirm">${esc(confirmText)}</button></div></div>`; const onExternalClose = () => resolve(false); const handleClick = e => { const action = e.target.dataset?.action; if (action === 'confirm') { window.EventBus.off('modal:closed', onExternalClose); resolve(true); hide(); } else if (action === 'cancel') { window.EventBus.off('modal:closed', onExternalClose); resolve(false); hide(); } }; window.EventBus.on('modal:closed', onExternalClose); modalContent.addEventListener('click', handleClick, { once: true }); modalOverlay.classList.remove('modal-hidden'); }); }
    if (modalClose) modalClose.addEventListener('click', hide);
    window.ModalManager = { show, hide, isVisible, confirm, registerType };
})();
