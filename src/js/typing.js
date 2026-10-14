// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Typing engine core module
 * Tracks typing progress, validates keystrokes, calculates metrics
 */
(() => {
    if (!window.EventBus) { console.error('EventBus not available. Include events.js before typing.js'); return; }
    if (!window.KeyUtils) { console.error('KeyUtils not available. Include utils.js before typing.js'); return; }

    const session = {
        text: '', currentIndex: 0, startTime: null, mistakes: {}, keystrokes: [],
        isActive: false, isPaused: false, totalErrors: 0, totalKeystrokes: 0,
        pausedTime: 0, pauseStartTime: null, typedChars: new Set(), hasError: false,
    };
    let strictMode = false;
    const IGNORED_KEYS = new Set(['Escape','CapsLock','NumLock','ScrollLock','Insert','ContextMenu','Dead']);
    let statsUpdateTimer = null; const STATS_UPDATE_THROTTLE = 100;
    let statsIntervalId = null;

    function calculateWPM() {
        const typedCount = session.typedChars.size;
        if (!session.startTime || typedCount === 0) return 0;
        const elapsed = getElapsedTimeSeconds(); if (elapsed === 0) return 0;
        return (typedCount / 5) / (elapsed / 60);
    }
    function calculateCPM() {
        const typedCount = session.typedChars.size;
        if (!session.startTime || typedCount === 0) return 0;
        const elapsed = getElapsedTimeSeconds(); if (elapsed === 0) return 0;
        return typedCount / (elapsed / 60);
    }
    function calculateAccuracy() {
        if (session.totalKeystrokes === 0) return 100;
        return ((session.totalKeystrokes - session.totalErrors) / session.totalKeystrokes) * 100;
    }
    function getElapsedTimeSeconds() {
        if (!session.startTime) return 0;
        let elapsed = Date.now() - session.startTime - session.pausedTime;
        if (session.isPaused && session.pauseStartTime) elapsed -= Date.now() - session.pauseStartTime;
        return elapsed / 1000;
    }
    function emitStatsUpdate() {
        if (statsUpdateTimer) return;
        statsUpdateTimer = setTimeout(() => {
            window.EventBus.emit('stats:update', { wpm: calculateWPM(), cpm: calculateCPM(), accuracy: calculateAccuracy(), time: getElapsedTimeSeconds() });
            statsUpdateTimer = null;
        }, STATS_UPDATE_THROTTLE);
    }
    function updateTargetKey() {
        const nextChar = session.text[session.currentIndex];
        if (window.KeyboardUI && nextChar) window.KeyboardUI.setTargetKey(nextChar);
        window.EventBus.emit('cursor:sync', { index: session.currentIndex });
    }

    function handleKeyDown(e) {
        if (!session.isActive) return;
        const target = e.target;
        if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') && target.id !== 'text-input') return;
        if (window.KeyUtils.isNavigationKey(e.key)) return;
        if ((e.ctrlKey || e.metaKey) && !(e.altKey && e.ctrlKey && e.key.length === 1)) return;
        if (IGNORED_KEYS.has(e.key)) return;
        if (e.isComposing || e.keyCode === 229) return;
        if (['Control','Alt','AltGraph','Meta','Shift'].includes(e.key)) return;
        if (session.isPaused) resume();
        if (['Tab','Enter',' '].includes(e.key)) e.preventDefault();
        const expectedChar = session.text[session.currentIndex];
        if (expectedChar === undefined) return;
        if (e.key === 'Backspace') {
            if (session.currentIndex > 0) { session.currentIndex--; session.hasError = false; updateTargetKey(); if (window.KeyboardUI) window.KeyboardUI.clearAllErrors(); window.EventBus.emit('typing:backspace', { index: session.currentIndex }); }
            return;
        }
        processChar(e.key);
    }
    function handleCompositionEnd(e) { if (!session.isActive || !e.data || e.target.id !== 'text-input') return; if (session.isPaused) resume(); for (const char of e.data) processChar(char); }
    function processChar(char) {
        const expectedChar = session.text[session.currentIndex];
        if (expectedChar === undefined) return;
        const pressedKey = window.KeyUtils.normalizeKey(char);
        const expectedKey = window.KeyUtils.normalizeTextChar(expectedChar);
        const isCorrect = pressedKey === expectedKey;
        session.totalKeystrokes++;
        session.keystrokes.push({ key: pressedKey, expected: expectedKey, isCorrect, index: session.currentIndex, timestamp: Date.now() });
        if (isCorrect) {
            session.typedChars.add(session.currentIndex); session.hasError = false;
            window.EventBus.emit('typing:keystroke', { char: expectedChar, expected: expectedKey, isCorrect: true, index: session.currentIndex });
            if (window.KeyboardUI) window.KeyboardUI.clearError(expectedKey);
            session.currentIndex++; updateTargetKey();
            if (session.currentIndex >= session.text.length) completeSession();
            emitStatsUpdate();
        } else {
            session.totalErrors++; session.mistakes[expectedKey] = (session.mistakes[expectedKey] || 0) + 1;
            window.EventBus.emit('typing:error', { char: expectedChar, expected: expectedKey, pressed: pressedKey, index: session.currentIndex });
            if (window.KeyboardUI) window.KeyboardUI.setError(expectedKey);
            if (strictMode) {
                session.currentIndex++; updateTargetKey();
            } else {
                session.hasError = true;
                // Allow typing the correct character to fix error (no backspace needed)
                if (pressedKey === expectedKey) {
                    session.hasError = false;
                    if (window.KeyboardUI) window.KeyboardUI.clearError(expectedKey);
                    session.currentIndex++; updateTargetKey();
                    if (session.currentIndex >= session.text.length) completeSession();
                    emitStatsUpdate();
                    return;
                }
            }
            emitStatsUpdate();
        }
    }
    function completeSession() {
        session.isActive = false;
        if (statsIntervalId) { clearInterval(statsIntervalId); statsIntervalId = null; }
        const sessionData = { text: session.text, currentIndex: session.currentIndex, startTime: session.startTime, endTime: Date.now(), duration: getElapsedTimeSeconds(), mistakes: {...session.mistakes}, keystrokes: [...session.keystrokes], totalErrors: session.totalErrors, totalKeystrokes: session.totalKeystrokes, wpm: calculateWPM(), cpm: calculateCPM(), accuracy: calculateAccuracy() };
        if (window.KeyboardUI) window.KeyboardUI.clearTarget();
        window.EventBus.emit('typing:complete', sessionData);
    }
    function start(text, startIndex = 0) {
        if (!text || text.length === 0) { console.error('TypingEngine.start: text cannot be empty'); return; }
        reset(); session.text = text; session.isActive = true; session.startTime = Date.now();
        session.currentIndex = Math.max(0, Math.min(startIndex, text.length - 1));
        const targetChar = text[session.currentIndex];
        if (window.KeyboardUI && targetChar) window.KeyboardUI.setTargetKey(targetChar);
        window.EventBus.emit('typing:start', { text, timestamp: session.startTime });
        window.EventBus.emit('cursor:sync', { index: session.currentIndex });
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('compositionend', handleCompositionEnd);
        if (statsIntervalId) clearInterval(statsIntervalId);
        statsIntervalId = setInterval(emitStatsUpdate, 1000);
    }
    function stop() {
        if (!session.isActive) return;
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('compositionend', handleCompositionEnd);
        if (statsIntervalId) { clearInterval(statsIntervalId); statsIntervalId = null; }
        if (session.currentIndex < session.text.length) session.isActive = false; else completeSession();
    }
    function pause() { if (!session.isActive || session.isPaused) return; session.isPaused = true; session.pauseStartTime = Date.now(); }
    function resume() { if (!session.isActive || !session.isPaused) return; if (session.pauseStartTime) { session.pausedTime += Date.now() - session.pauseStartTime; session.pauseStartTime = null; } session.isPaused = false; }
    function reset() {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('compositionend', handleCompositionEnd);
        if (statsIntervalId) { clearInterval(statsIntervalId); statsIntervalId = null; }
        Object.assign(session, { text: '', currentIndex: 0, startTime: null, mistakes: {}, keystrokes: [], isActive: false, isPaused: false, totalErrors: 0, totalKeystrokes: 0, pausedTime: 0, pauseStartTime: null, typedChars: new Set(), hasError: false });
        if (statsUpdateTimer) { clearTimeout(statsUpdateTimer); statsUpdateTimer = null; }
        if (window.KeyboardUI) window.KeyboardUI.clearTarget();
    }
    function getSessionData() { return { text: session.text, currentIndex: session.currentIndex, startTime: session.startTime, mistakes: {...session.mistakes}, keystrokes: [...session.keystrokes], isActive: session.isActive, isPaused: session.isPaused, totalErrors: session.totalErrors, totalKeystrokes: session.totalKeystrokes, duration: getElapsedTimeSeconds() }; }
    function getCurrentIndex() { return session.currentIndex; }
    function getMetrics() { return { wpm: calculateWPM(), cpm: calculateCPM(), accuracy: calculateAccuracy(), time: getElapsedTimeSeconds() }; }
    function setCurrentIndex(index) { if (index < 0 || index > session.text.length) return; session.currentIndex = index; session.hasError = false; updateTargetKey(); }
    function setStrictMode(enabled) { strictMode = Boolean(enabled); session.hasError = false; if (window.KeyboardUI) window.KeyboardUI.clearAllErrors(); }
    function getStrictMode() { return strictMode; }
    window.EventBus.on('cursor:move', data => { if (data.index !== undefined) { if (window.KeyboardUI) window.KeyboardUI.clearAllErrors(); setCurrentIndex(data.index); } });
    window.TypingEngine = { start, stop, pause, resume, reset, getSessionData, getCurrentIndex, setCurrentIndex, getMetrics, setStrictMode, getStrictMode, handleKeyDown };
})();
