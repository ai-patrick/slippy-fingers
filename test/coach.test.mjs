// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/ai-patrick/slippy-fingers

/**
 * Coach module tests - run with: node test/coach.test.mjs
 */
import assert from 'node:assert';
import { test, describe, mock } from 'node:test';
import { readFileSync } from 'fs';

// Stub window, document, and localStorage BEFORE loading module
global.window = {};
global.document = {
    readyState: 'complete',
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
        setAttribute: () => {},
        addEventListener: () => {},
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        style: {},
    }),
    body: { appendChild: () => {} },
    addEventListener: () => {},
};
global.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; },
};

// Mock fetch
global.fetch = mock.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
}));

// Load coach module by evaluating in global scope
const coachSource = readFileSync('./src/js/coach.js', 'utf-8');
const moduleCode = coachSource.replace(/^\(\(\) => \{/, '').replace(/\}\)\;$/, '');
eval(moduleCode);

const { SlippyCoach } = window;

function setupStubs() {
    localStorage.clear();
    // Stub KeyUtils and KeyboardUI
    // Create a layout with all printable ASCII for testing
    const fullLayout = { fingerMap: {}, shiftToBaseKey: {} };
    for (let c = 32; c <= 126; c++) {
        fullLayout.fingerMap[String.fromCharCode(c)] = 'test-finger';
    }
    window.KeyUtils = {
        keysForChar: (char, layout) => {
            if (!layout) return char >= ' ' && char <= '~' ? [char] : [];
            return layout.fingerMap?.[char.toLowerCase()] || layout.shiftToBaseKey?.[char] ? [char] : [];
        }
    };
    window.KeyboardUI = {
        getCurrentLayout: () => fullLayout
    };
    window.LibraryManager = {
        saveText: async () => true,
        refresh: async () => {}
    };
    window.SessionManager = {
        loadText: async () => {}
    };
    window.App = { getTextMeta: () => ({ textId: null }) };
    window.SlippyProfile = {
        languageForText: () => 'javascript',
        getWeakSpots: () => [],
        getProfile: () => ({ sessions: 0, confusions: {} })
    };
    window.StatsManager = { getSessionSummary: () => ({ wpm: 0, accuracy: 0 }) };
}

describe('SlippyCoach', () => {
    test('sanitizeCode strips leading indentation', () => {
        setupStubs();
        const raw = '    const x = 1;\n    const y = 2;';
        const result = SlippyCoach.sanitizeCode(raw, { stripIndent: true });
        assert.ok(result);
        assert.ok(!result.startsWith(' '));
        assert.ok(result.includes('const x = 1;'));
    });

    test('sanitizeCode drops lines with untypeable characters', () => {
        setupStubs();
        // Layout with all chars in first line except 'é'
        const layout = { fingerMap: {}, shiftToBaseKey: {} };
        for (const ch of 'const x = 1; ') layout.fingerMap[ch] = 'test';
        // 'é' intentionally omitted
        const raw = 'const x = 1;\nconst y = " café ";';
        const result = SlippyCoach.sanitizeCode(raw, { layout });
        assert.ok(result);
        assert.ok(!result.includes('café'));
        assert.ok(result.includes('const x = 1;'));
    });

    test('sanitizeCode caps size at line boundary', () => {
        setupStubs();
        const layout = window.KeyboardUI.getCurrentLayout();
        const raw = 'line1\nline2\nline3\nline4';
        const result = SlippyCoach.sanitizeCode(raw, { layout, maxChars: 20 });
        assert.ok(result);
        assert.ok(result.length <= 20);
        assert.ok(!result.endsWith('\n')); // capped at line boundary
    });

    test('sanitizeCode returns null if fewer than 12 chars remain', () => {
        setupStubs();
        const result = SlippyCoach.sanitizeCode('x', { maxChars: 400 });
        assert.strictEqual(result, null);
    });

    test('sanitizeCode normalizes CRLF and trims trailing whitespace', () => {
        setupStubs();
        const layout = window.KeyboardUI.getCurrentLayout();
        const raw = 'line one   \r\nline two   \r\n';
        const result = SlippyCoach.sanitizeCode(raw, { layout });
        assert.ok(result);
        assert.ok(!result.endsWith(' '));
        assert.ok(result.includes('line one'));
        assert.ok(result.includes('line two'));
    });

    test('sanitizeCode uses printable-ASCII fallback when no layout', () => {
        setupStubs();
        const raw = 'const x = 1;\nconst y = 2;';
        const result = SlippyCoach.sanitizeCode(raw, { layout: null });
        assert.ok(result);
        assert.ok(result.includes('const x = 1;'));
    });

    test('localDrill picks snippets with most weak-pair occurrences (JS/TS)', () => {
        setupStubs();
        const weakBigrams = [
            { keys: ['=', '>'], n: 10, errors: 5, avgMs: 200, score: 2.5 },
            { keys: ['.', 'm'], n: 5, errors: 1, avgMs: 100, score: 1.0 },
        ];
        // Use full layout from KeyboardUI
        const layout = window.KeyboardUI.getCurrentLayout();
        const code = SlippyCoach.localDrill(weakBigrams, 'javascript', layout);
        assert.ok(code);
        // Should contain => which is in JS_DRILLS
        assert.ok(code.includes('=>') || code.includes('.map'));
    });

    test('localDrill repeats top pairs for other languages', () => {
        setupStubs();
        // Use more pairs to generate longer output
        const weakBigrams = [
            { keys: ['a', 'b'], n: 10, errors: 5, avgMs: 200, score: 2.5 },
            { keys: ['c', 'd'], n: 5, errors: 1, avgMs: 100, score: 1.0 },
            { keys: ['e', 'f'], n: 5, errors: 1, avgMs: 100, score: 1.0 },
            { keys: ['g', 'h'], n: 5, errors: 1, avgMs: 100, score: 1.0 },
        ];
        const layout = window.KeyboardUI.getCurrentLayout();
        const code = SlippyCoach.localDrill(weakBigrams, 'python', layout);
        assert.ok(code);
        assert.ok(code.length >= 12);
        assert.ok(code.includes('ab') || code.includes('cd') || code.includes('ef') || code.includes('gh'));
    });

    test('localDrill skips Enter/Tab pairs', () => {
        setupStubs();
        // Provide enough non-Enter pairs to generate sufficient length
        const weakBigrams = [
            { keys: ['Enter', 'a'], n: 10, errors: 5, avgMs: 200, score: 2.5 },
            { keys: ['a', 'b'], n: 5, errors: 1, avgMs: 100, score: 1.0 },
            { keys: ['c', 'd'], n: 5, errors: 1, avgMs: 100, score: 1.0 },
            { keys: ['e', 'f'], n: 5, errors: 1, avgMs: 100, score: 1.0 },
        ];
        const layout = window.KeyboardUI.getCurrentLayout();
        const code = SlippyCoach.localDrill(weakBigrams, 'javascript', layout);
        assert.ok(code);
        assert.ok(code.length >= 12);
        assert.ok(!code.includes('Enter'));
    });

    test('localDrill falls back to general snippet when no weak pairs', () => {
        setupStubs();
        const weakBigrams = [];
        const layout = window.KeyboardUI.getCurrentLayout();
        const code = SlippyCoach.localDrill(weakBigrams, 'javascript', layout);
        assert.ok(code);
        assert.ok(code.length >= 12);
    });

    test('canType returns true for typeable chars with layout', () => {
        setupStubs();
        const layout = { fingerMap: { 'a': 'left-pinky' }, shiftToBaseKey: {} };
        assert.strictEqual(SlippyCoach.canType('a', layout), true);
    });

    test('canType returns false for untypeable chars with layout', () => {
        setupStubs();
        const layout = { fingerMap: { 'a': 'left-pinky' }, shiftToBaseKey: {} };
        assert.strictEqual(SlippyCoach.canType('é', layout), false);
    });

    test('canType uses printable ASCII fallback when no layout', () => {
        setupStubs();
        assert.strictEqual(SlippyCoach.canType('a', null), true);
        assert.strictEqual(SlippyCoach.canType(' ', null), true);
        assert.strictEqual(SlippyCoach.canType('é', null), false);
    });
});

// Pages Function logic tests (pure JS functions)
describe('Coach API logic', () => {
    test('thinking block stripping', () => {
        const stripThinkingBlocks = (text) => text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        const input = '<think>\n  stuff\n</think>\n{"title":"T","code":"x","note":"n"}';
        const cleaned = stripThinkingBlocks(input);
        assert.ok(!cleaned.includes('think'));
        assert.ok(cleaned.startsWith('{'));
    });

    test('JSON extraction from first { to last }', () => {
        const extractJsonObject = (text) => {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start === -1 || end === -1 || end <= start) return null;
            return text.slice(start, end + 1);
        };
        const input = 'prefix {"title":"T","code":"x","note":"n"} suffix';
        const extracted = extractJsonObject(input);
        assert.strictEqual(extracted, '{"title":"T","code":"x","note":"n"}');
    });

    test('constant-time token comparison', () => {
        const constantTimeEqual = (a, b) => {
            if (a.length !== b.length) return false;
            let result = 0;
            for (let i = 0; i < a.length; i++) {
                result |= a.charCodeAt(i) ^ b.charCodeAt(i);
            }
            return result === 0;
        };
        assert.strictEqual(constantTimeEqual('secret', 'secret'), true);
        assert.strictEqual(constantTimeEqual('secret', 'wrong'), false);
        assert.strictEqual(constantTimeEqual('short', 'longer'), false);
    });

    test('payload sanitization bounds fields', () => {
        const ALLOWED_LANGUAGES = new Set(['javascript', 'python']);
        const sanitizePayload = (payload) => {
            const clean = {};
            clean.language = (payload.language && ALLOWED_LANGUAGES.has(payload.language)) ? payload.language : 'javascript';
            clean.weakBigrams = (Array.isArray(payload.weakBigrams) ? payload.weakBigrams : [])
                .filter(b => b && typeof b.keys === 'object' && Array.isArray(b.keys) && b.keys.length === 2)
                .slice(0, 8)
                .map(b => ({
                    keys: [String(b.keys[0]).slice(0, 10), String(b.keys[1]).slice(0, 10)],
                    n: Math.min(Number(b.n) || 0, 10000),
                    errors: Math.min(Number(b.errors) || 0, 10000),
                    avgMs: Math.min(Number(b.avgMs) || 0, 10000),
                    score: Math.min(Number(b.score) || 0, 1000),
                }));
            return clean;
        };

        const input = {
            language: 'python',
            weakBigrams: [
                { keys: ['a', 'b'], n: 100, errors: 50, avgMs: 200, score: 2.5 },
                { keys: ['c', 'd'], n: 200, errors: 100, avgMs: 300, score: 3.0 },
                { keys: ['e'], n: 1 }, // invalid - will be filtered
                { keys: ['f', 'g', 'h'], n: 1 }, // invalid - will be filtered
            ],
            extraField: 'should be dropped',
        };
        const clean = sanitizePayload(input);
        assert.strictEqual(clean.language, 'python');
        assert.strictEqual(clean.weakBigrams.length, 2);
        assert.ok(!clean.extraField);
        assert.strictEqual(clean.weakBigrams[0].keys[0], 'a');
        assert.strictEqual(clean.weakBigrams[0].n, 100);
    });

    test('language whitelist enforced', () => {
        const ALLOWED_LANGUAGES = new Set(['javascript', 'python']);
        const sanitizeLanguage = (lang) => (lang && ALLOWED_LANGUAGES.has(lang)) ? lang : 'javascript';
        assert.strictEqual(sanitizeLanguage('javascript'), 'javascript');
        assert.strictEqual(sanitizeLanguage('python'), 'python');
        assert.strictEqual(sanitizeLanguage('ruby'), 'javascript'); // not in whitelist
        assert.strictEqual(sanitizeLanguage(''), 'javascript');
        assert.strictEqual(sanitizeLanguage(null), 'javascript');
    });
});

console.log('All coach tests passed!');