// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/ai-patrick/slippy-fingers

/**
 * Application Controller - Main orchestrator
 */
(() => {
    function bindButtonHandlers() {
        const bind = (id, handler) => { const btn = document.getElementById(id); if (btn) { btn.addEventListener('click', () => { handler(); btn.blur(); }); } };
        bind('theme-toggle', () => window.SettingsManager.toggleTheme());
        bind('color-settings', openColorSettings);
        bind('zen-toggle', () => window.SettingsManager.toggleZenMode());
        bind('stats-toggle', () => window.SettingsManager.toggleStatsBar());
        bind('keyboard-toggle', () => window.SettingsManager.toggleKeyboard());
        bind('reset-session', () => window.SessionManager.reset());
        bind('strict-mode-toggle', () => window.SettingsManager.toggleStrictMode());
        bind('zoom-in', () => window.SettingsManager.zoomIn());
        bind('zoom-out', () => window.SettingsManager.zoomOut());
        bind('layout-toggle', () => window.UIManager?.showModal('settings', {}));
        const githubLink = document.getElementById('github-link');
        if (githubLink) githubLink.addEventListener('click', e => { e.preventDefault(); window.open('https://github.com/ai-patrick/slippy-fingers', '_blank', 'noopener'); });
    }
    function openColorSettings() { window.UIManager?.showModal('color-settings', { theme: window.SettingsManager.getTheme() }); }
    function checkModules() { const required = ['EventBus','TypingEngine','UIManager','KeyboardUI','SettingsManager','SessionManager']; for (const name of required) if (!window[name]) { console.error(`${name} not available. Ensure corresponding .js is loaded.`); return false; } return true; }
    async function initialize() {
        if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        await window.SupportedLanguages?.load?.();
        const settings = await window.SettingsManager.load();
        window.SettingsManager.applyTheme(settings.theme, false);
        window.SettingsManager.applyZenMode(settings.zenMode, false);
        window.SettingsManager.applyKeyboardVisibility(settings.showKeyboard, false);
        window.SettingsManager.applyStatsBarVisibility(settings.showStatsBar, false);
        window.SettingsManager.applyStrictMode(settings.strictMode, false);
        if (settings.keyboardLayout) window.SettingsManager.applyKeyboardLayout(settings.keyboardLayout, false);
        if (settings.textZoom && settings.textZoom !== 1.0) window.SettingsManager.applyTextZoom(settings.textZoom, false);
        bindButtonHandlers();
        if (!checkModules()) return;
        let text = settings.lastTextId ? await window.SessionManager.loadText(settings.lastTextId) : null;
        if (!text) text = await window.SessionManager.loadDefault();
        if (!text?.length) { console.error('No text available.'); return; }
        window.EventBus.on('modal:closed', () => { const session = window.TypingEngine?.getSessionData(); if (!session?.isActive) window.SessionManager.setupTypingStart(); });
        window.EventBus.on('typing:complete', () => window.SessionManager.setupTypingStart());
        window.EventBus.emit('app:ready', { text, timestamp: Date.now() });
        console.log('Slippy Fingers initialized successfully');
    }
    function boot() { initialize().then(() => { window.ShortcutsManager?.init(); window.LibraryManager?.init(); window.SessionManager?.setupTypingStart(); }); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    window.App = { reset: () => window.SessionManager?.reset(), loadText: id => window.SessionManager?.loadText(id), openSettings: () => window.UIManager?.showModal('settings', {}), openColorSettings, toggleKeyboard: () => window.SettingsManager?.toggleKeyboard(), applyKeyboardVisibility: (v,p) => window.SettingsManager?.applyKeyboardVisibility(v,p), toggleStatsBar: () => window.SettingsManager?.toggleStatsBar(), applyStatsBarVisibility: (v,p) => window.SettingsManager?.applyStatsBarVisibility(v,p), toggleTheme: () => window.SettingsManager?.toggleTheme(), applyTheme: (t,p) => window.SettingsManager?.applyTheme(t,p), toggleZenMode: () => window.SettingsManager?.toggleZenMode(), applyZenMode: (e,p) => window.SettingsManager?.applyZenMode(e,p), toggleStrictMode: () => window.SettingsManager?.toggleStrictMode(), applyStrictMode: (e,p) => window.SettingsManager?.applyStrictMode(e,p), getTextMeta: () => window.SessionManager?.getTextMeta(), toggleLibrary: () => window.LibraryManager?.toggle(), openTextEditor: id => window.LibraryManager?.openEditor(id) };
    window.SlippyFingers = {
        Events: window.EventBus, Keyboard: window.KeyboardUI, Typing: window.TypingEngine,
        UI: window.UIManager, Stats: window.StatsManager, Settings: window.SettingsManager,
        Session: window.SessionManager, Library: window.LibraryManager, Shortcuts: window.ShortcutsManager, App: window.App,
        Utils: { Key: window.KeyUtils, App: window.AppUtils, Color: window.ColorUtils },
        Layouts: window.KeyboardLayouts, Languages: window.SupportedLanguages, Colors: window.ColorSchemes, Constants: window.AppConstants,
    };
    console.log('%cSlippy Fingers %cv1.0.0', 'font-weight: bold; font-size: 14px; color: #4A90E2', 'font-weight: normal; color: #888');
    console.log('Modules loaded:', Object.keys(window.SlippyFingers).join(', '));
})();
