// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Keyboard layouts registry
 * Loads layout modules and provides unified API
 */
(() => {
    const registry = {};
    let defaultLayoutId = 'en-qwerty';

    function register(layout) {
        if (!layout.id) { console.error('Layout must have an id'); return; }
        registry[layout.id] = layout;
    }

    function getLayout(layoutId) { return registry[layoutId] || null; }
    function getAvailableLayouts() { return Object.keys(registry); }
    function getDefaultLayout() { return registry[defaultLayoutId] || null; }
    function setDefault(layoutId) {
        if (!registry[layoutId]) { console.warn(`Layout "${layoutId}" not found`); return false; }
        defaultLayoutId = layoutId; return true;
    }

    function autoRegister() {
        Object.keys(window).filter(k => k.startsWith('LAYOUT_')).forEach(k => register(window[k]));
        if (!registry[defaultLayoutId]) console.warn(`Default layout "${defaultLayoutId}" not registered. Available:`, Object.keys(registry));
    }

    window.KeyboardLayouts = { register, getLayout, getAvailableLayouts, getDefaultLayout, setDefault, _autoRegister: autoRegister };
    autoRegister();
})();
