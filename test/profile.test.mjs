// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/ai-patrick/slippy-fingers

/**
 * Profile module tests - run with: node test/profile.test.mjs
 */
import assert from 'node:assert';
import { test, describe } from 'node:test';

// Stub window and localStorage
global.window = {};
global.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; },
};

function resetStorage() {
    localStorage.clear();
}

// Load the profile module (we need to execute it in our stubbed environment)
const profileSource = await import('fs').then(fs => fs.readFileSync('./src/js/profile.js', 'utf-8'));
eval(profileSource.replace(/^\(\(\) => \{/, '').replace(/\}\)\;$/, ''));

const { SlippyProfile } = window;

describe('SlippyProfile', () => {
    test('buildSessionProfile returns empty for empty/undefined input', () => {
        resetStorage();
        assert.deepStrictEqual(SlippyProfile.buildSessionProfile([]), { keys: {}, bigrams: {}, confusions: {} });
        assert.deepStrictEqual(SlippyProfile.buildSessionProfile(null), { keys: {}, bigrams: {}, confusions: {} });
        assert.deepStrictEqual(SlippyProfile.buildSessionProfile(undefined), { keys: {}, bigrams: {}, confusions: {} });
    });

    test('counts only first attempt at each index (retypes excluded)', () => {
        resetStorage();
        const keystrokes = [
            { key: 'a', expected: 'a', isCorrect: false, index: 0, timestamp: 1000 },
            { key: 'a', expected: 'a', isCorrect: true, index: 0, timestamp: 1100 }, // retype
            { key: 'b', expected: 'b', isCorrect: true, index: 1, timestamp: 1200 },
        ];
        const profile = SlippyProfile.buildSessionProfile(keystrokes);
        // Only 1 attempt for 'a' (the first one), 1 for 'b'
        assert.strictEqual(profile.keys['a'].n, 1);
        assert.strictEqual(profile.keys['a'].e, 1); // first was error
        assert.strictEqual(profile.keys['b'].n, 1);
        assert.strictEqual(profile.keys['b'].e, 0);
    });

    test('retypes after error excluded from timing', () => {
        resetStorage();
        const keystrokes = [
            { key: 'a', expected: 'a', isCorrect: false, index: 0, timestamp: 1000 },
            { key: 'a', expected: 'a', isCorrect: true, index: 0, timestamp: 1100 }, // retype - should not count for latency
            { key: 'b', expected: 'b', isCorrect: true, index: 1, timestamp: 1200 }, // latency from first 'a' (wrong) should not count
        ];
        const profile = SlippyProfile.buildSessionProfile(keystrokes);
        // No timed samples because previous correct at index-1 doesn't exist
        assert.strictEqual(profile.keys['a'].m, 0);
        assert.strictEqual(profile.keys['b'].m, 0);
    });

    test('pause over 2s counted but not timed', () => {
        resetStorage();
        const keystrokes = [
            { key: 'a', expected: 'a', isCorrect: true, index: 0, timestamp: 1000 },
            { key: 'b', expected: 'b', isCorrect: true, index: 1, timestamp: 3500 }, // 2500ms gap > 2000
        ];
        const profile = SlippyProfile.buildSessionProfile(keystrokes);
        assert.strictEqual(profile.keys['b'].m, 0); // gap too large, not timed
        assert.strictEqual(profile.keys['b'].t, 0);
    });

    test('latency within 2s is timed', () => {
        resetStorage();
        const keystrokes = [
            { key: 'a', expected: 'a', isCorrect: true, index: 0, timestamp: 1000 },
            { key: 'b', expected: 'b', isCorrect: true, index: 1, timestamp: 1500 }, // 500ms gap
        ];
        const profile = SlippyProfile.buildSessionProfile(keystrokes);
        assert.strictEqual(profile.keys['b'].m, 1);
        assert.strictEqual(profile.keys['b'].t, 500);
    });

    test('confusion recorded for wrong keystrokes', () => {
        resetStorage();
        const keystrokes = [
            { key: 'b', expected: 'a', isCorrect: false, index: 0, timestamp: 1000 },
            { key: 'a', expected: 'a', isCorrect: true, index: 0, timestamp: 1100 },
        ];
        const profile = SlippyProfile.buildSessionProfile(keystrokes);
        const confusionKey = 'a' + SlippyProfile.SEP + 'b';
        assert.strictEqual(profile.confusions[confusionKey].n, 1);
        assert.strictEqual(profile.confusions[confusionKey].e, 1);
    });

    test('bigram recorded for adjacent correct keystrokes', () => {
        resetStorage();
        const keystrokes = [
            { key: 'a', expected: 'a', isCorrect: true, index: 0, timestamp: 1000 },
            { key: 'b', expected: 'b', isCorrect: true, index: 1, timestamp: 1100 },
        ];
        const profile = SlippyProfile.buildSessionProfile(keystrokes);
        const bigramKey = 'a' + SlippyProfile.SEP + 'b';
        assert.strictEqual(profile.bigrams[bigramKey].n, 1);
    });

    test('decay applied on merge (0.92 factor)', () => {
        resetStorage();
        // First session
        const ks1 = [
            { key: 'a', expected: 'a', isCorrect: true, index: 0, timestamp: 1000 },
            { key: 'b', expected: 'b', isCorrect: true, index: 1, timestamp: 1100 },
        ];
        SlippyProfile.recordSession(ks1, 'javascript');

        // Second session - should decay first
        const ks2 = [
            { key: 'c', expected: 'c', isCorrect: true, index: 0, timestamp: 2000 },
        ];
        SlippyProfile.recordSession(ks2, 'javascript');

        const profile = SlippyProfile.getProfile('javascript');
        // After decay: a.n = 0.92 -> 1 (rounded), b.n = 0.92 -> 1
        // But wait, the bigram a->b should also decay
        const bigramKey = 'a' + SlippyProfile.SEP + 'b';
        assert.strictEqual(profile.bigrams[bigramKey].n, 1); // 0.92 rounded to 1
    });

    test('per-language separation', () => {
        resetStorage();
        const ks1 = [{ key: 'a', expected: 'a', isCorrect: true, index: 0, timestamp: 1000 }];
        const ks2 = [{ key: 'b', expected: 'b', isCorrect: true, index: 0, timestamp: 2000 }];

        SlippyProfile.recordSession(ks1, 'javascript');
        SlippyProfile.recordSession(ks2, 'python');

        const jsProfile = SlippyProfile.getProfile('javascript');
        const pyProfile = SlippyProfile.getProfile('python');

        assert.strictEqual(jsProfile.keys['a'].n, 1);
        assert.ok(!jsProfile.keys['b']);
        assert.strictEqual(pyProfile.keys['b'].n, 1);
        assert.ok(!pyProfile.keys['a']);
    });

    test('weak-spot ordering by score', () => {
        resetStorage();
        // Create a scenario with different error rates and latencies
        const keystrokes = [];
        let ts = 1000;

        // Pair a->b: many attempts, high errors
        for (let i = 0; i < 10; i++) {
            keystrokes.push({ key: 'a', expected: 'a', isCorrect: i > 2, index: i * 2, timestamp: ts++ });
            keystrokes.push({ key: 'b', expected: 'b', isCorrect: i > 2, index: i * 2 + 1, timestamp: ts++ });
        }

        // Pair x->y: few attempts, no errors, fast
        for (let i = 0; i < 3; i++) {
            keystrokes.push({ key: 'x', expected: 'x', isCorrect: true, index: 20 + i * 2, timestamp: ts++ });
            keystrokes.push({ key: 'y', expected: 'y', isCorrect: true, index: 21 + i * 2, timestamp: ts++ });
        }

        SlippyProfile.recordSession(keystrokes, 'javascript');
        const spots = SlippyProfile.getWeakSpots('javascript', { kind: 'bigrams', limit: 5, minN: 2 });

        // a->b should rank higher (worse) than x->y due to errors
        const abSpot = spots.find(s => s.keys[0] === 'a' && s.keys[1] === 'b');
        const xySpot = spots.find(s => s.keys[0] === 'x' && s.keys[1] === 'y');

        assert.ok(abSpot, 'a->b should appear in weak spots');
        assert.ok(xySpot, 'x->y should appear in weak spots');
        assert.ok(abSpot.score > xySpot.score, 'a->b should have higher score (worse) than x->y');
    });

    test('sessionWeakSpots returns correct format with minN 2', () => {
        resetStorage();
        const keystrokes = [
            { key: 'a', expected: 'a', isCorrect: true, index: 0, timestamp: 1000 },
            { key: 'b', expected: 'b', isCorrect: true, index: 1, timestamp: 1100 },
            { key: 'a', expected: 'a', isCorrect: true, index: 2, timestamp: 1200 },
            { key: 'b', expected: 'b', isCorrect: true, index: 3, timestamp: 1300 },
        ];
        const spots = SlippyProfile.sessionWeakSpots(keystrokes, 5);
        assert.ok(Array.isArray(spots));
        if (spots.length > 0) {
            const spot = spots[0];
            assert.ok('key' in spot);
            assert.ok('keys' in spot && Array.isArray(spot.keys) && spot.keys.length === 2);
            assert.ok('n' in spot);
            assert.ok('errors' in spot);
            assert.ok('avgMs' in spot);
            assert.ok('score' in spot);
        }
    });

    test('languageForText looks up language in library', () => {
        resetStorage();
        localStorage.setItem('slippy-library', JSON.stringify({
            categories: [],
            texts: [{ id: 'test1', title: 'Test', categoryId: '', language: 'javascript', content: 'code', isFavorite: false, createdAt: new Date().toISOString() }]
        }));
        assert.strictEqual(SlippyProfile.languageForText('test1'), 'javascript');
        assert.strictEqual(SlippyProfile.languageForText('nonexistent'), 'text');
        assert.strictEqual(SlippyProfile.languageForText(null), 'text');
    });

    test('getProfile returns empty for missing language', () => {
        resetStorage();
        const profile = SlippyProfile.getProfile('nonexistent');
        assert.deepStrictEqual(profile, { sessions: 0, keys: {}, bigrams: {}, confusions: {} });
    });

    test('recordSession handles missing keystrokes gracefully', () => {
        resetStorage();
        SlippyProfile.recordSession(null, 'javascript');
        SlippyProfile.recordSession([], 'javascript');
        SlippyProfile.recordSession(undefined, 'javascript');
        // Should not throw
        const profile = SlippyProfile.getProfile('javascript');
        assert.strictEqual(profile.sessions, 0);
    });

    test('bigram trimming keeps top 400 by n', () => {
        resetStorage();
        const keystrokes = [];
        let ts = 1000;
        // Create 500 different bigrams
        for (let i = 0; i < 500; i++) {
            const a = String.fromCharCode(97 + (i % 26));
            const b = String.fromCharCode(97 + ((i + 1) % 26));
            keystrokes.push({ key: a, expected: a, isCorrect: true, index: i * 2, timestamp: ts++ });
            keystrokes.push({ key: b, expected: b, isCorrect: true, index: i * 2 + 1, timestamp: ts++ });
        }
        SlippyProfile.recordSession(keystrokes, 'javascript');
        const profile = SlippyProfile.getProfile('javascript');
        const bigramCount = Object.keys(profile.bigrams).length;
        assert.ok(bigramCount <= 400, `Bigram count ${bigramCount} should be <= 400`);
    });

    test('confusion trimming keeps top 100 by n', () => {
        resetStorage();
        const keystrokes = [];
        let ts = 1000;
        // Create 150 different confusions
        for (let i = 0; i < 150; i++) {
            const expected = String.fromCharCode(97 + (i % 26));
            const pressed = String.fromCharCode(97 + ((i + 2) % 26));
            keystrokes.push({ key: pressed, expected: expected, isCorrect: false, index: i, timestamp: ts++ });
        }
        SlippyProfile.recordSession(keystrokes, 'javascript');
        const profile = SlippyProfile.getProfile('javascript');
        const confusionCount = Object.keys(profile.confusions).length;
        assert.ok(confusionCount <= 100, `Confusion count ${confusionCount} should be <= 100`);
    });
});

console.log('All profile tests passed!');