// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Session Manager - manages text loading, typing session lifecycle
 */
(() => {
    let currentText = null, currentTextMeta = null, startHandlerRef = null;
    const STORAGE_KEY = 'slippy-library';
    const DEFAULT_TEXTS = [
        { id: 'welcome', title: 'Welcome to Slippy Fingers', categoryId: '', language: 'text', content: 'Welcome to Slippy Fingers! This is a touch typing trainer that helps you improve your typing speed and accuracy. Type this text to get started.', isFavorite: true, createdAt: new Date().toISOString() },
        { id: 'pangram', title: 'The Quick Brown Fox', categoryId: '', language: 'text', content: 'The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.', isFavorite: false, createdAt: new Date().toISOString() },
    ];

    function setInitialTarget(text) { if (text?.length > 0 && window.KeyboardUI) window.KeyboardUI.setTargetKey(text[0]); }
    function buildLiveSummary() { if (!window.TypingEngine) return null; const session = window.TypingEngine.getSessionData(); if (!session || (session.totalKeystrokes === 0 && session.currentIndex === 0)) return null; const metrics = window.TypingEngine.getMetrics(); return { ...session, wpm: metrics?.wpm ?? 0, cpm: metrics?.cpm ?? 0, accuracy: metrics?.accuracy ?? 100, duration: metrics?.time ?? session.duration ?? 0, totalErrors: session.totalErrors ?? 0, totalKeystrokes: session.totalKeystrokes ?? 0 }; }
    function showStatsModal() { if (!window.UIManager) return; window.TypingEngine?.pause(); const summary = buildLiveSummary() || window.StatsManager?.getSessionSummary?.(); if (summary) { summary.isCompleted = false; window.UIManager.showModal('session-summary', summary); } }

    async function loadLibrary() { try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) return JSON.parse(stored); } catch { } return { categories: [], texts: DEFAULT_TEXTS }; }

    async function getDefaultText() { const library = await loadLibrary(); if (library.texts.length > 0) { const text = library.texts[0]; currentTextMeta = { textId: text.id, textTitle: text.title, categoryId: text.categoryId }; return text.content; } return ''; }

    async function loadText(textId) { const library = await loadLibrary(); const text = library.texts.find(t => t.id === textId); if (!text?.content?.length) { console.error('Text not found:', textId); return; } currentTextMeta = { textId: text.id, textTitle: text.title, categoryId: text.categoryId }; currentText = text.content; window.TypingEngine?.reset(); window.UIManager?.renderText(currentText); setInitialTarget(currentText); setupTypingStart(); try { const settings = JSON.parse(localStorage.getItem('slippy-settings') || '{}'); settings.lastTextId = textId; localStorage.setItem('slippy-settings', JSON.stringify(settings)); } catch {} return currentText; }

    function shouldStartSession(e) { if (['Control','Alt','Meta','Shift'].includes(e.key)) return false; if (e.ctrlKey || e.metaKey) return false; if (window.KeyUtils?.isNavigationKey?.(e.key)) return false; return true; }

    function setupTypingStart() { if (!window.TypingEngine) return; if (startHandlerRef) { window.removeEventListener('keydown', startHandlerRef); startHandlerRef = null; } const startHandler = async e => { if (!shouldStartSession(e)) return; const session = window.TypingEngine.getSessionData(); if (session.isActive) { window.removeEventListener('keydown', startHandler); startHandlerRef = null; return; } if (!currentText?.length) { currentText = await getDefaultText(); if (!currentText?.length) return; window.UIManager?.renderText(currentText); } const textInput = document.getElementById('text-input'); const cursorPos = textInput?.selectionStart ?? 0; window.removeEventListener('keydown', startHandler); startHandlerRef = null; window.TypingEngine.start(currentText, cursorPos); window.TypingEngine.handleKeyDown?.(e); }; startHandlerRef = startHandler; window.addEventListener('keydown', startHandler); }

    function reset() { window.TypingEngine?.reset(); window.UIManager?.updateStats(0,0,100,0); window.StatsManager?.clearHeatmap(); window.KeyboardUI?.clearAllErrors(); if (currentText?.length) { window.UIManager?.renderText(currentText); setInitialTarget(currentText); setupTypingStart(); } else { getDefaultText().then(text => { if (!text?.length) return; currentText = text; window.UIManager?.renderText(text); setInitialTarget(text); setupTypingStart(); }); } }
    async function loadDefault() { const text = await getDefaultText(); if (text?.length) { currentText = text; window.UIManager?.renderText(text); setInitialTarget(text); } return text; }
    function getTextMeta() { return currentTextMeta ? { ...currentTextMeta } : null; }

    window.SessionManager = { loadDefault, loadText, reset, getTextMeta, showStatsModal, setupTypingStart };
})();
