// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Utility functions for key and character normalization
 * Shared across keyboard.js, typing.js, and app.js
 */
(() => {
    const NAVIGATION_KEYS = new Set([
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End', 'PageUp', 'PageDown',
    ]);

    function normalizeKey(key) { return typeof key === 'string' ? key.normalize('NFC') : key; }
    function normalizeTextChar(char) {
        if (char === ' ') return ' ';
        if (char === '\n') return 'Enter';
        if (char === '\t') return 'Tab';
        return typeof char === 'string' ? char.normalize('NFC') : char;
    }
    function isNavigationKey(key) { return NAVIGATION_KEYS.has(key); }
    function formatTime(seconds) {
        const total = Number.isFinite(seconds) ? Math.max(seconds, 0) : 0;
        const mins = Math.floor(total / 60);
        const secs = Math.floor(total % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const map = { '&': '\u0026amp;', '<': '\u0026lt;', '>': '\u0026gt;', '"': '\u0026quot;', "'": '\u0026#39;' };
        return String(str).replace(/[&<>"']/g, c => map[c]);
    }
    function deadKeySequence(char, layout) {
        if (!layout?.deadKeys || typeof char !== 'string' || char.length !== 1) return null;
        if (layout.fingerMap?.[char.toLowerCase()] || layout.shiftToBaseKey?.[char]) return null;
        const [base, mark, ...rest] = char.normalize('NFD');
        const deadKey = !rest.length && layout.deadKeys[mark];
        return deadKey ? [deadKey, base] : null;
    }
    function baseKey(char, layout) {
        if (layout?.shiftToBaseKey?.[char]) return layout.shiftToBaseKey[char];
        return char.length === 1 ? char.toLowerCase() : char;
    }
    function keysForChar(char, layout) { return (deadKeySequence(char, layout) ?? [char]).map(c => baseKey(c, layout)); }
    window.KeyUtils = { normalizeKey, normalizeTextChar, isNavigationKey, deadKeySequence, baseKey, keysForChar };
    window.AppUtils = { formatTime, escapeHtml };
})();
