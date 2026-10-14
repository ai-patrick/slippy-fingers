// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Shortcuts Manager - global keyboard shortcuts
 */
(() => {
    function isModalVisible() { return window.ModalManager?.isVisible() || false; }
    function isLibraryVisible() { return window.LibraryManager?.isVisible() || false; }
    function init() {
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape') { if (isLibraryVisible()) { e.preventDefault(); window.LibraryManager?.hide(); return; } e.preventDefault(); if (isModalVisible()) window.ModalManager?.hide(); else window.SessionManager?.showStatsModal(); return; }
            if (e.key === ',' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); window.UIManager?.showModal('settings', {}); return; }
            if (e.key === 'k' && (e.ctrlKey || e.metaKey) && e.altKey) { e.preventDefault(); window.SettingsManager?.toggleKeyboard(); return; }
            if (e.key === 's' && (e.ctrlKey || e.metaKey) && e.altKey) { e.preventDefault(); window.SettingsManager?.toggleStatsBar(); return; }
            if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.altKey) { e.preventDefault(); window.SettingsManager?.toggleZenMode(); return; }
            if (e.key === 'r' && (e.ctrlKey || e.metaKey) && e.altKey) { e.preventDefault(); window.SessionManager?.reset(); return; }
            if (e.key === 'l' && (e.ctrlKey || e.metaKey) && e.altKey) { e.preventDefault(); window.LibraryManager?.toggle(); return; }
            if ((e.key === '=' || e.key === '+') && (e.ctrlKey || e.metaKey) && !e.altKey) { e.preventDefault(); window.SettingsManager?.zoomIn(); return; }
            if (e.key === '-' && (e.ctrlKey || e.metaKey) && !e.altKey) { e.preventDefault(); window.SettingsManager?.zoomOut(); return; }
            if (e.key === '0' && (e.ctrlKey || e.metaKey) && !e.altKey) { e.preventDefault(); window.SettingsManager?.resetZoom(); return; }
            if (e.key === 'n' && (e.ctrlKey || e.metaKey) && e.altKey) { e.preventDefault(); if (isModalVisible()) window.ModalManager?.hide(); else window.LibraryManager?.openEditor(null); }
        });
    }
    window.ShortcutsManager = { init };
})();
