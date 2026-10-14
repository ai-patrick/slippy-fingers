// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/ai-patrick/slippy-fingers

/**
 * Profile Layer - builds per-language typing profiles from keystroke data
 * Tracks key stats, bigrams, and confusions with exponential decay
 */
(() => {
    const STORAGE_KEY = 'slippy-profile';
    const PROFILE_VERSION = 1;
    const DECAY_FACTOR = 0.92;
    const MAX_BIGRAMS = 400;
    const MAX_CONFUSIONS = 100;
    const MAX_LATENCY_MS = 2000;
    const MIN_TIMED_SAMPLES_FOR_MEDIAN = 2;
    const SEP = '\u0001';

    function roundStat(obj) {
        if (!obj) return obj;
        return {
            n: Math.round(obj.n),
            e: Math.round(obj.e),
            t: Math.round(obj.t),
            m: Math.round(obj.m),
        };
    }

    function decayStats(stats) {
        if (!stats) return stats;
        return {
            n: Math.round(stats.n * DECAY_FACTOR),
            e: Math.round(stats.e * DECAY_FACTOR),
            t: Math.round(stats.t * DECAY_FACTOR),
            m: Math.round(stats.m * DECAY_FACTOR),
        };
    }

    function mergeStat(target, source) {
        if (!target) return roundStat(source);
        return roundStat({
            n: target.n + source.n,
            e: target.e + source.e,
            t: target.t + source.t,
            m: target.m + source.m,
        });
    }

    function getMedianAvgMs(statsMap) {
        const avgs = [];
        for (const stat of statsMap.values()) {
            if (stat.m >= MIN_TIMED_SAMPLES_FOR_MEDIAN && stat.n > 0) {
                avgs.push(stat.t / stat.m);
            }
        }
        if (avgs.length === 0) return 0;
        avgs.sort((a, b) => a - b);
        const mid = Math.floor(avgs.length / 2);
        return avgs.length % 2 === 0 ? (avgs[mid - 1] + avgs[mid]) / 2 : avgs[mid];
    }

    function calculateScore(stat, medianAvgMs) {
        if (!stat || stat.n === 0) return 0;
        const errorRate = (stat.e + 0.5) / (stat.n + 5);
        const avgMs = stat.m > 0 ? stat.t / stat.m : 0;
        const latencyPenalty = medianAvgMs > 0 ? Math.max(0, avgMs / medianAvgMs - 1) : 0;
        return 3 * errorRate + latencyPenalty;
    }

    function buildSessionProfile(keystrokes) {
        if (!keystrokes || !Array.isArray(keystrokes) || keystrokes.length === 0) {
            return { keys: {}, bigrams: {}, confusions: {} };
        }

        const keys = {};
        const bigrams = {};
        const confusions = {};

        // Track first-attempt result per index
        const firstAttemptCorrect = new Map(); // index -> boolean
        const firstAttemptTimestamp = new Map(); // index -> timestamp (only for correct first attempts)
        const firstAttemptExpected = new Map(); // index -> expected key

        let lastFirstAttemptCorrectIndex = -1;
        let lastFirstAttemptCorrectTimestamp = null;

        for (let i = 0; i < keystrokes.length; i++) {
            const ks = keystrokes[i];
            const expected = ks.expected;
            const pressed = ks.key;
            const isCorrect = ks.isCorrect;
            const index = ks.index;
            const timestamp = ks.timestamp;

            if (!expected) continue;

            // Count only first attempt at each index
            const existingKey = keys[expected];
            const isFirstAttempt = !existingKey || existingKey._lastIndex !== index;
            if (isFirstAttempt) {
                keys[expected] = mergeStat(keys[expected], { n: 1, e: isCorrect ? 0 : 1, t: 0, m: 0 });
                keys[expected]._lastIndex = index;

                // Record first-attempt result for this index
                firstAttemptCorrect.set(index, isCorrect);
                firstAttemptExpected.set(index, expected);
                if (isCorrect) {
                    firstAttemptTimestamp.set(index, timestamp);
                }
            }
            // Note: retypes do NOT update firstAttemptCorrect/Timestamp - only the actual first attempt matters

            // Confusion: expected + SEP + pressed for every wrong keystroke
            if (!isCorrect) {
                const confusionKey = expected + SEP + pressed;
                confusions[confusionKey] = mergeStat(confusions[confusionKey], { n: 1, e: 1, t: 0, m: 0 });
            }

            // Process bigram and latency when we have a first attempt at this index
            // (whether correct or not - bigram attempts are counted for all adjacent first attempts)
            if (firstAttemptCorrect.has(index)) {
                const currentFirstAttemptCorrect = firstAttemptCorrect.get(index);
                const currentFirstAttemptTs = firstAttemptTimestamp.get(index); // undefined if incorrect

                // Bigram: prevExpected (from first attempt at index-1) + SEP + expected
                // Count attempt for every adjacent pair of first attempts
                if (index > 0 && firstAttemptExpected.has(index - 1)) {
                    const prevExpected = firstAttemptExpected.get(index - 1);
                    const prevWasCorrect = firstAttemptCorrect.get(index - 1) === true;
                    const bigramKey = prevExpected + SEP + expected;
                    // Bigram attempt counted; error if either first attempt was wrong
                    bigrams[bigramKey] = mergeStat(bigrams[bigramKey], {
                        n: 1,
                        e: (prevWasCorrect && currentFirstAttemptCorrect) ? 0 : 1,
                        t: 0,
                        m: 0,
                    });
                }

                // Latency: only when current first attempt is correct
                // timestamp minus previous FIRST-ATTEMPT CORRECT keystroke at index-1
                if (currentFirstAttemptCorrect && currentFirstAttemptTs !== undefined) {
                    if (lastFirstAttemptCorrectIndex === index - 1 && lastFirstAttemptCorrectTimestamp !== null) {
                        const latency = currentFirstAttemptTs - lastFirstAttemptCorrectTimestamp;
                        if (latency > 0 && latency <= MAX_LATENCY_MS) {
                            keys[expected] = mergeStat(keys[expected], { n: 0, e: 0, t: latency, m: 1 });
                        }
                    }
                    // Update last first-attempt correct for next iteration
                    lastFirstAttemptCorrectIndex = index;
                    lastFirstAttemptCorrectTimestamp = currentFirstAttemptTs;
                }
            }
        }

        // Clean up internal tracking fields
        for (const key of Object.keys(keys)) {
            delete keys[key]._lastIndex;
        }

        return { keys, bigrams, confusions };
    }

    function recordSession(keystrokes, language) {
        if (!keystrokes || !Array.isArray(keystrokes) || keystrokes.length === 0) return;
        if (!language) language = 'text';

        try {
            const sessionProfile = buildSessionProfile(keystrokes);

            let stored = { v: PROFILE_VERSION, langs: {} };
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) stored = JSON.parse(raw);
            } catch {}

            if (stored.v !== PROFILE_VERSION) {
                stored = { v: PROFILE_VERSION, langs: {} };
            }

            if (!stored.langs[language]) {
                stored.langs[language] = { sessions: 0, keys: {}, bigrams: {}, confusions: {} };
            }

            const langProfile = stored.langs[language];

            // Decay existing stats
            for (const key of Object.keys(langProfile.keys)) {
                langProfile.keys[key] = decayStats(langProfile.keys[key]);
                if (langProfile.keys[key].n === 0) delete langProfile.keys[key];
            }
            for (const key of Object.keys(langProfile.bigrams)) {
                langProfile.bigrams[key] = decayStats(langProfile.bigrams[key]);
                if (langProfile.bigrams[key].n === 0) delete langProfile.bigrams[key];
            }
            for (const key of Object.keys(langProfile.confusions)) {
                langProfile.confusions[key] = decayStats(langProfile.confusions[key]);
                if (langProfile.confusions[key].n === 0) delete langProfile.confusions[key];
            }

            // Merge session stats
            for (const [key, stat] of Object.entries(sessionProfile.keys)) {
                langProfile.keys[key] = mergeStat(langProfile.keys[key], stat);
            }
            for (const [key, stat] of Object.entries(sessionProfile.bigrams)) {
                langProfile.bigrams[key] = mergeStat(langProfile.bigrams[key], stat);
            }
            for (const [key, stat] of Object.entries(sessionProfile.confusions)) {
                langProfile.confusions[key] = mergeStat(langProfile.confusions[key], stat);
            }

            // Trim bigrams to top 400 by n
            const bigramEntries = Object.entries(langProfile.bigrams).sort((a, b) => b[1].n - a[1].n);
            if (bigramEntries.length > MAX_BIGRAMS) {
                langProfile.bigrams = Object.fromEntries(bigramEntries.slice(0, MAX_BIGRAMS));
            }

            // Trim confusions to top 100 by n
            const confusionEntries = Object.entries(langProfile.confusions).sort((a, b) => b[1].n - a[1].n);
            if (confusionEntries.length > MAX_CONFUSIONS) {
                langProfile.confusions = Object.fromEntries(confusionEntries.slice(0, MAX_CONFUSIONS));
            }

            langProfile.sessions = (langProfile.sessions || 0) + 1;

            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch (err) {
            console.warn('SlippyProfile: failed to record session:', err);
        }
    }

    function sessionWeakSpots(keystrokes, limit = 5) {
        if (!keystrokes || !Array.isArray(keystrokes)) return [];
        const profile = buildSessionProfile(keystrokes);
        const medianAvgMs = getMedianAvgMs(new Map(Object.entries(profile.bigrams)));

        const rows = [];
        for (const [bigramKey, stat] of Object.entries(profile.bigrams)) {
            if (stat.n < 2) continue;
            const [a, b] = bigramKey.split(SEP);
            const score = calculateScore(stat, medianAvgMs);
            rows.push({ key: bigramKey, keys: [a, b], n: stat.n, errors: stat.e, avgMs: stat.m > 0 ? Math.round(stat.t / stat.m) : 0, score });
        }

        rows.sort((a, b) => b.score - a.score);
        return rows.slice(0, limit);
    }

    function getWeakSpots(language, options = {}) {
        const { kind = 'bigrams', limit = 10, minN = 2 } = options;
        if (!language) language = 'text';

        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const langProfile = stored.langs?.[language];
            if (!langProfile) return [];

            const source = kind === 'keys' ? langProfile.keys : langProfile.bigrams;
            const medianAvgMs = getMedianAvgMs(new Map(Object.entries(source)));

            const rows = [];
            for (const [key, stat] of Object.entries(source)) {
                if (stat.n < minN) continue;
                if (kind === 'bigrams') {
                    const [a, b] = key.split(SEP);
                    const score = calculateScore(stat, medianAvgMs);
                    rows.push({ key, keys: [a, b], n: stat.n, errors: stat.e, avgMs: stat.m > 0 ? Math.round(stat.t / stat.m) : 0, score });
                } else {
                    const score = calculateScore(stat, medianAvgMs);
                    rows.push({ key, keys: [key], n: stat.n, errors: stat.e, avgMs: stat.m > 0 ? Math.round(stat.t / stat.m) : 0, score });
                }
            }

            rows.sort((a, b) => b.score - a.score);
            return rows.slice(0, limit);
        } catch (err) {
            console.warn('SlippyProfile: failed to get weak spots:', err);
            return [];
        }
    }

    function getProfile(language) {
        if (!language) language = 'text';
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return stored.langs?.[language] || { sessions: 0, keys: {}, bigrams: {}, confusions: {} };
        } catch {
            return { sessions: 0, keys: {}, bigrams: {}, confusions: {} };
        }
    }

    function languageForText(textId) {
        if (!textId) return 'text';
        try {
            const stored = localStorage.getItem('slippy-library');
            if (!stored) return 'text';
            const library = JSON.parse(stored);
            const text = library.texts?.find(t => t.id === textId);
            return text?.language || 'text';
        } catch {
            return 'text';
        }
    }

    window.SlippyProfile = {
        buildSessionProfile,
        recordSession,
        sessionWeakSpots,
        getWeakSpots,
        getProfile,
        languageForText,
        SEP,
    };
})();