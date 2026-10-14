// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/ai-patrick/slippy-fingers

/**
 * AI Coach Client - fetches personalized drills, falls back to local generation
 */
(() => {
    const COACH_STORAGE_KEY = 'slippy-coach';
    const COACH_CATEGORY_NAME = 'Coach';
    const MAX_COACH_TEXTS = 15;

    // Built-in JS/TS drill snippets (~14 idiomatic one-liners)
    const JS_DRILLS = [
        'const map = arr => arr.map(x => x * 2);',
        'const filter = (arr, fn) => arr.filter(fn);',
        'const reduce = (arr, fn, init) => arr.reduce(fn, init);',
        'const find = (arr, fn) => arr.find(fn);',
        'const includes = (arr, val) => arr.includes(val);',
        'const keys = obj => Object.keys(obj);',
        'const values = obj => Object.values(obj);',
        'const entries = obj => Object.entries(obj);',
        'const assign = (target, ...sources) => Object.assign(target, ...sources);',
        'const freeze = obj => Object.freeze(obj);',
        'const seal = obj => Object.seal(obj);',
        'const create = (proto, props) => Object.create(proto, props);',
        'const define = (obj, prop, desc) => Object.defineProperty(obj, prop, desc);',
        'const getOwn = (obj, prop) => Object.getOwnPropertyDescriptor(obj, prop);',
    ];

    const COACH_TOKEN_KEY = 'slippy-coach-token';
    const COACH_LANG_KEY = 'slippy-coach-lang';

    function getToken() {
        try {
            return localStorage.getItem(COACH_TOKEN_KEY) || '';
        } catch {
            return '';
        }
    }

    function setToken(token) {
        try {
            if (token) localStorage.setItem(COACH_TOKEN_KEY, token);
            else localStorage.removeItem(COACH_TOKEN_KEY);
        } catch {}
    }

    function getStoredLanguage() {
        try {
            return localStorage.getItem(COACH_LANG_KEY) || 'javascript';
        } catch {
            return 'javascript';
        }
    }

    function setLanguage(lang) {
        try {
            if (lang) localStorage.setItem(COACH_LANG_KEY, lang);
        } catch {}
    }

    function canType(char, layout) {
        if (!layout) return char >= ' ' && char <= '~'; // printable ASCII fallback
        const keys = window.KeyUtils?.keysForChar?.(char, layout);
        return keys && keys.length > 0;
    }

    function sanitizeCode(raw, { layout, stripIndent = true, maxChars = 400, maxLines = 10 } = {}) {
        if (!raw || typeof raw !== 'string') return null;

        let code = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // Strip leading indentation
        if (stripIndent) {
            const lines = code.split('\n');
            const nonEmptyLines = lines.filter(l => l.trim().length > 0);
            if (nonEmptyLines.length > 0) {
                const minIndent = Math.min(...nonEmptyLines.map(l => l.length - l.trimStart().length));
                code = lines.map(l => l.slice(minIndent)).join('\n');
            }
        }

        // Trim trailing whitespace per line, drop blank lines
        const lines = code.split('\n')
            .map(l => l.trimEnd())
            .filter(l => l.length > 0);

        // Drop lines with untypeable characters
        const filteredLines = lines.filter(line => {
            for (const ch of line) {
                if (!canType(ch, layout)) return false;
            }
            return true;
        });

        // Cap at maxLines
        const cappedLines = filteredLines.slice(0, maxLines);

        // Cap at maxChars at line boundary
        let result = '';
        for (const line of cappedLines) {
            if (result.length + line.length + 1 > maxChars) break;
            result += (result ? '\n' : '') + line;
        }

        if (result.length < 12) return null;
        return result;
    }

    function countPairOccurrences(code, pair) {
        const [a, b] = pair;
        let count = 0;
        for (let i = 0; i < code.length - 1; i++) {
            if (code[i] === a && code[i + 1] === b) count++;
        }
        return count;
    }

    function localDrill(weakBigrams, language, layout) {
        const targetPairs = (weakBigrams || [])
            .filter(b => b.keys && b.keys.length === 2)
            .map(b => [b.keys[0], b.keys[1]])
            .filter(([a, b]) => a !== 'Enter' && a !== 'Tab' && b !== 'Enter' && b !== 'Tab');

        if (targetPairs.length === 0) {
            // General symbol-heavy fallback
            const fallback = language === 'javascript' || language === 'typescript'
                ? 'const x = { a: 1, b: 2 };\nconst y = [1, 2, 3].map(n => n * 2);'
                : 'x = { "a": 1 }\ny = [1, 2, 3]';
            return sanitizeCode(fallback, { layout });
        }

        if (language === 'javascript' || language === 'typescript') {
            // Rank JS_DRILLS by weighted pair occurrences
            const ranked = JS_DRILLS.map(snippet => {
                let weight = 0;
                for (const pair of targetPairs) {
                    const occurrences = countPairOccurrences(snippet, pair);
                    // Find the bigram stat for this pair to get its score
                    const bigram = weakBigrams.find(b => b.keys[0] === pair[0] && b.keys[1] === pair[1]);
                    const pairScore = bigram?.score || 1;
                    weight += occurrences * pairScore;
                }
                return { snippet, weight };
            });
            ranked.sort((a, b) => b.weight - a.weight);

            // Pick top 3 with weight > 0, or top 3 anyway
            const selected = ranked.filter(r => r.weight > 0).slice(0, 3);
            if (selected.length === 0) {
                // Fallback: repeat top pairs
                const topPairs = targetPairs.slice(0, 3);
                const repeated = topPairs.map(([a, b]) => a + b + a + b).join(' ');
                return sanitizeCode(repeated, { layout });
            }

            const combined = selected.map(s => s.snippet).join('\n');
            return sanitizeCode(combined, { layout });
        } else {
            // Other languages: repeat top pairs
            const topPairs = targetPairs.slice(0, 3);
            const repeated = topPairs.map(([a, b]) => a + b + a + b).join(' ');
            return sanitizeCode(repeated, { layout });
        }
    }

    async function train() {
        const btn = document.getElementById('coach-train');
        const toast = document.getElementById('coach-toast');
        if (btn) btn.setAttribute('aria-busy', 'true');
        if (toast) {
            toast.textContent = '';
            toast.classList.remove('show', 'error');
        }

        try {
            // Determine language
            const textMeta = window.App?.getTextMeta?.() || {};
            let language = window.SlippyProfile?.languageForText?.(textMeta.textId) || 'text';
            if (language === 'text') language = getStoredLanguage();

            // Build payload from profile
            const weakBigrams = window.SlippyProfile?.getWeakSpots?.(language, { kind: 'bigrams', limit: 8, minN: 3 }) || [];
            const weakKeys = window.SlippyProfile?.getWeakSpots?.(language, { kind: 'keys', limit: 5, minN: 4 }) || [];
            const profile = window.SlippyProfile?.getProfile?.(language) || {};
            const confusions = Object.entries(profile.confusions || {})
                .sort((a, b) => b[1].n - a[1].n)
                .slice(0, 5)
                .map(([key, stat]) => ({ key, n: stat.n, errors: stat.e }));

            const sessionSummary = window.StatsManager?.getSessionSummary?.() || {};
            const payload = {
                language,
                weakBigrams,
                weakKeys,
                confusions,
                sessions: profile.sessions || 0,
                lastWpm: sessionSummary.wpm || 0,
                lastAccuracy: sessionSummary.accuracy || 0,
            };

            const token = getToken();
            let aiResult = null;
            let fallbackReason = null;

            if (token) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 20000);
                    const response = await fetch('/api/coach', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-coach-token': token,
                        },
                        body: JSON.stringify(payload),
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        aiResult = await response.json();
                    } else {
                        fallbackReason = `API ${response.status}`;
                    }
                } catch (err) {
                    fallbackReason = err.name === 'AbortError' ? 'timeout' : 'network error';
                }
            } else {
                fallbackReason = 'no token';
            }

            let code = null;
            let note = '';
            let source = 'local';

            if (aiResult?.code) {
                const layout = window.KeyboardUI?.getCurrentLayout?.();
                code = sanitizeCode(aiResult.code, { layout });
                if (code) {
                    note = aiResult.note || '';
                    source = 'ai';
                } else {
                    fallbackReason = 'AI code sanitization failed';
                }
            }

            if (!code) {
                const layout = window.KeyboardUI?.getCurrentLayout?.();
                code = localDrill(weakBigrams, language, layout);
                if (!note) {
                    const pairs = weakBigrams.slice(0, 3).map(b => `${b.keys[0]}→${b.keys[1]}`).join(', ');
                    note = pairs
                        ? `Drill targets: ${pairs}. Tip: slow down and hit each transition deliberately.`
                        : 'General symbol drill. Tip: focus on accuracy over speed.';
                }
                if (fallbackReason) note = `[${source}: ${fallbackReason}] ${note}`;
            }

            if (!code) {
                throw new Error('Failed to generate drill');
            }

            // Save to library
            await saveCoachText(code, language, aiResult?.title || 'Coach Drill', note, source);

            // Load the new text
            const library = JSON.parse(localStorage.getItem('slippy-library') || '{"categories":[],"texts":[]}');
            const coachText = library.texts
                .filter(t => t.categoryId === getCoachCategoryId(library))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            if (coachText) {
                await window.SessionManager?.loadText(coachText.id);
            }

            // Show toast
            if (toast) {
                toast.textContent = note;
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 5000);
            }
        } catch (err) {
            console.error('Coach train failed:', err);
            if (toast) {
                toast.textContent = `Error: ${err.message}`;
                toast.classList.add('show', 'error');
                setTimeout(() => toast.classList.remove('show'), 5000);
            }
        } finally {
            if (btn) btn.removeAttribute('aria-busy');
        }
    }

    function getCoachCategoryId(library) {
        const cat = library.categories?.find(c => c.name === COACH_CATEGORY_NAME);
        return cat?.id || '';
    }

    async function saveCoachText(code, language, title, note, source) {
        if (!window.LibraryManager) return;

        // Prune old coach texts
        const library = JSON.parse(localStorage.getItem('slippy-library') || '{"categories":[],"texts":[]}');
        const coachCatId = getCoachCategoryId(library);
        let coachTexts = library.texts.filter(t => t.categoryId === coachCatId);
        coachTexts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (coachTexts.length >= MAX_COACH_TEXTS) {
            const toDelete = coachTexts.slice(MAX_COACH_TEXTS - 1);
            for (const t of toDelete) {
                library.texts = library.texts.filter(x => x.id !== t.id);
            }
            localStorage.setItem('slippy-library', JSON.stringify(library));
            await window.LibraryManager.refresh();
        }

        // Save new text with timestamped title
        const timestampedTitle = `${title} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        await window.LibraryManager.saveText({
            title: timestampedTitle,
            categoryName: COACH_CATEGORY_NAME,
            language,
            content: code,
            isFavorite: false,
        });
    }

    function init() {
        // Add coach button after #text-add in #library-controls
        const textAddBtn = document.getElementById('text-add');
        if (textAddBtn && !document.getElementById('coach-train')) {
            const btn = document.createElement('button');
            btn.id = 'coach-train';
            btn.title = 'Train me';
            btn.type = 'button';
            btn.setAttribute('aria-label', 'AI Coach: Generate practice drill');
            btn.innerHTML = '🎯';
            btn.addEventListener('click', e => {
                e.stopPropagation();
                train();
                btn.blur();
            });
            textAddBtn.parentNode.insertBefore(btn, textAddBtn.nextSibling);
        }

        // Create toast element
        if (!document.getElementById('coach-toast')) {
            const toast = document.createElement('div');
            toast.id = 'coach-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
    }

    // Expose public API
    window.SlippyCoach = {
        train,
        setToken,
        setLanguage,
        sanitizeCode,
        localDrill,
        canType,
    };

    // Auto-init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();