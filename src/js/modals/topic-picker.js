// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/ai-patrick/slippy-fingers

/**
 * Topic Picker Modal - browse and select texts by category/topic
 */
(() => {
    if (!window.ModalManager) { console.error('ModalManager not available. Include modals/core.js first'); return; }
    if (!window.LibraryManager) { console.error('LibraryManager not available'); return; }
    const esc = window.AppUtils?.escapeHtml || (s => String(s ?? ''));
    const ICON = { bookOpen: `<svg width="16" height="16"><use href="#icon-book-open"/></svg>`, code: `<svg width="16" height="16"><use href="#icon-languages"/></svg>` };

    function render(data) {
        const library = window.LibraryManager.getLibrary?.() || { categories: [], texts: [] };
        const { categories, texts } = library;

        if (texts.length === 0) {
            return `<div class="topic-picker empty"><p>No texts in library. Add some first!</p></div>`;
        }

        // Group texts by category
        const categoryMap = new Map();
        categories.forEach(c => categoryMap.set(c.id, { ...c, texts: [] }));
        categoryMap.set('', { id: '', name: 'Uncategorized', icon: '📄', texts: [] });

        texts.forEach(t => {
            const cat = categoryMap.get(t.categoryId) || categoryMap.get('');
            cat.texts.push(t);
        });

        // Filter out empty categories unless it's the only one
        const displayCategories = [...categoryMap.values()].filter(c => c.texts.length > 0 || categoryMap.size === 1);

        let html = '<div class="topic-picker"><div class="topic-search"><input type="text" id="topic-search" placeholder="Search topics..." autocomplete="off"></div><div class="topic-list">';

        displayCategories.forEach(cat => {
            const icon = esc(cat.icon || '📄');
            const name = esc(cat.name);
            const count = cat.texts.length;
            html += `<div class="topic-category" data-category="${esc(cat.id)}"><div class="topic-category-header"><span class="icon">${icon}</span><span class="name">${name}</span><span class="count">${count}</span></div><div class="topic-items">`;
            cat.texts.forEach(text => {
                const lang = window.SupportedLanguages?.sanitize?.(text.language) || 'text';
                const langIcon = window.SupportedLanguages?.getIcon?.(lang) || '📄';
                const langLabel = lang === 'text' ? 'Text' : esc(lang);
                const title = esc(text.title);
                const isFav = text.isFavorite ? '★ ' : '';
                html += `<button class="topic-item" data-id="${esc(text.id)}" title="${title}">${isFav}<span class="topic-title">${title}</span><span class="topic-meta">${langIcon} ${langLabel}</span></button>`;
            });
            html += '</div></div>';
        });

        html += '</div></div>';
        return html;
    }

    function bind(data, content) {
        const searchInput = content.querySelector('#topic-search');
        const items = content.querySelectorAll('.topic-item');
        const categories = content.querySelectorAll('.topic-category');

        // Search filter
        searchInput?.addEventListener('input', e => {
            const query = e.target.value.toLowerCase();
            items.forEach(item => {
                const title = item.querySelector('.topic-title').textContent.toLowerCase();
                const match = title.includes(query);
                item.style.display = match ? '' : 'none';
            });
            categories.forEach(cat => {
                const visible = cat.querySelectorAll('.topic-item:not([style*="none"])').length > 0;
                cat.style.display = visible ? '' : 'none';
            });
        });

        // Click handler
        items.forEach(item => {
            item.addEventListener('click', () => {
                window.ModalManager.hide();
                window.SessionManager?.loadText(item.dataset.id);
            });
        });

        // Expand/collapse categories
        content.querySelectorAll('.topic-category-header').forEach(header => {
            header.addEventListener('click', () => {
                const cat = header.closest('.topic-category');
                cat.classList.toggle('collapsed');
            });
        });
    }

    function getTitle() { return 'Select Topic'; }

    window.ModalManager.registerType('topic-picker', { title: getTitle, render, bind });
})();