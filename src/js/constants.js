// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Application-wide constants
 * Languages are loaded from localStorage (single source of truth)
 */
(() => {
    let languageMap = {};
    let loaded = false;

    // Default language data (fallback if localStorage not available)
    const DEFAULT_LANGUAGES = [
        { key: 'text', icon: '📄', label: 'Text' },
        { key: 'javascript', icon: '🟨', label: 'JavaScript' },
        { key: 'typescript', icon: '🔷', label: 'TypeScript' },
        { key: 'python', icon: '🐍', label: 'Python' },
        { key: 'go', icon: '🐹', label: 'Go' },
        { key: 'rust', icon: '🦀', label: 'Rust' },
        { key: 'c', icon: '🔵', label: 'C' },
        { key: 'cpp', icon: '🔷', label: 'C++' },
        { key: 'java', icon: '☕', label: 'Java' },
        { key: 'html', icon: '🌐', label: 'HTML' },
        { key: 'css', icon: '🎨', label: 'CSS' },
        { key: 'json', icon: '📋', label: 'JSON' },
        { key: 'markdown', icon: '📝', label: 'Markdown' },
        { key: 'shell', icon: '🐚', label: 'Shell' },
        { key: 'sql', icon: '🗄️', label: 'SQL' },
    ];

    window.SupportedLanguages = {
        async load() {
            try {
                const stored = localStorage.getItem('slippy-languages');
                if (stored) {
                    languageMap = JSON.parse(stored);
                } else {
                    languageMap = {};
                    DEFAULT_LANGUAGES.forEach(l => languageMap[l.key] = { icon: l.icon, label: l.label });
                    await this.save();
                }
                loaded = true;
                return true;
            } catch (err) {
                console.error('SupportedLanguages: failed to load:', err);
                languageMap = {};
                DEFAULT_LANGUAGES.forEach(l => languageMap[l.key] = { icon: l.icon, label: l.label });
                loaded = true;
                return false;
            }
        },

        async save() {
            try {
                localStorage.setItem('slippy-languages', JSON.stringify(languageMap));
            } catch (err) { console.warn('Failed to save languages:', err); }
        },

        isLoaded() { return loaded; },

        getIcon(lang) { return languageMap[lang]?.icon || '📄'; },
        getLabel(lang) { return languageMap[lang]?.label || lang || 'Text'; },

        sanitize(input) {
            if (!input) return 'text';
            const normalized = input.toLowerCase().trim();
            return languageMap[normalized] ? normalized : 'text';
        },

        keys() { return Object.keys(languageMap); },

        async add(lang) {
            if (!languageMap[lang.key]) {
                languageMap[lang.key] = { icon: lang.icon, label: lang.label };
                await this.save();
            }
        },
    };
})();
