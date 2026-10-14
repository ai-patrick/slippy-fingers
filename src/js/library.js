// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * Library Manager - manages text library sidebar: categories, text list, CRUD
 */
(() => {
    const esc = window.AppUtils?.escapeHtml || (s => String(s ?? ''));
    const ICON = { bookOpen: `<svg width="16" height="16"><use href="#icon-book-open"/></svg>`, trash: `<svg width="14" height="14"><use href="#icon-trash"/></svg>`, pencil: `<svg width="14" height="14"><use href="#icon-pencil"/></svg>`, star: `<svg width="12" height="12"><use href="#icon-star"/></svg>` };
    const state = { library: null, selectedCategory: null, isExpanded: false, isVisible: false };
    const STORAGE_KEY = 'slippy-library';
    const getEl = id => document.getElementById(id);

    async function loadLibrary() { try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) { state.library = JSON.parse(stored); return state.library; } } catch {} state.library = { categories: [], texts: [] }; return state.library; }
    async function saveLibrary() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.library)); } catch (err) { console.error('Failed to save library:', err); } }
    function normalizeLanguage(lang) { return window.SupportedLanguages?.sanitize?.(lang) || 'text'; }
    function langIcon(lang) { return window.SupportedLanguages?.getIcon?.(normalizeLanguage(lang)) || '📄'; }
    function renderCategories() {
        const container = getEl('category-tree'); if (!container || !state.library) return;
        const { categories, texts } = state.library;
        const counts = {}; texts.forEach(t => counts[t.categoryId] = (counts[t.categoryId] || 0) + 1);
        const allCount = texts.length; const isAllActive = !state.selectedCategory; const allExpanded = isAllActive && state.isExpanded;
        let html = '<ul class="category-list">';
        html += `<li class="category-item${isAllActive ? ' active' : ''}${allExpanded ? ' expanded' : ''}" data-category=""><span class="icon">${ICON.bookOpen}</span><span>All</span><span class="count">${allCount}</span></li>`;
        if (allExpanded) html += renderTextsForCategory(null);
        categories.forEach(cat => {
            const isActive = state.selectedCategory === cat.id; const isExpanded = isActive && state.isExpanded; const count = counts[cat.id] || 0;
            const catId = esc(cat.id), catName = esc(cat.name); const icon = esc(cat.icon || '📁');
            html += `<li class="category-item${isActive ? ' active' : ''}${isExpanded ? ' expanded' : ''}" data-category="${catId}"><span class="icon">${icon}</span><span>${catName}</span><span class="spacer"></span><span class="count">${count}</span><button class="delete-btn" data-id="${catId}" title="Delete category">${ICON.trash}</button></li>`;
            if (isExpanded) html += renderTextsForCategory(cat.id);
        });
        html += '</ul>'; container.innerHTML = html;
        container.querySelectorAll('.category-item').forEach(item => item.addEventListener('click', e => { if (e.target.closest('.delete-btn')) return; const clickedCat = item.dataset.category || null; if (state.selectedCategory === clickedCat) state.isExpanded = !state.isExpanded; else { state.selectedCategory = clickedCat; state.isExpanded = true; } renderCategories(); }));
        container.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); deleteCategory(btn.dataset.id); }));
        bindTextItemHandlers(container);
    }
    function renderTextsForCategory(categoryId) {
        const texts = state.library.texts.filter(t => categoryId === null ? true : t.categoryId === categoryId);
        if (texts.length === 0) return `<div class="library-empty"><p>No texts in this category</p><button class="empty-add-text" data-category="${esc(categoryId || '')}">+ Add</button></div>`;
        let html = '<div>'; texts.forEach(text => { const fav = text.isFavorite ? `<span class="favorite">${ICON.star}</span>` : ''; const lang = normalizeLanguage(text.language); const langLabel = lang === 'text' ? 'Text' : esc(lang); const textId = esc(text.id), textTitle = esc(text.title); html += `<div class="text-item" data-id="${textId}"><div class="text-item-title">${fav}${textTitle}</div><div class="text-item-meta"><span>${langIcon(lang)} ${langLabel}</span></div><div class="text-item-actions"><button class="icon-btn edit-btn" data-id="${textId}" title="Edit">${ICON.pencil}</button><button class="icon-btn delete-btn" data-id="${textId}" title="Delete">${ICON.trash}</button></div></div>`; }); html += '</div>'; return html;
    }
    function bindTextItemHandlers(container) {
        container.querySelectorAll('.empty-add-text').forEach(btn => btn.addEventListener('click', () => openEditor(null)));
        container.querySelectorAll('.text-item').forEach(item => item.addEventListener('click', e => { if (e.target.closest('button')) return; selectText(item.dataset.id); }));
        container.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openEditor(btn.dataset.id); }));
        container.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); deleteText(btn.dataset.id); }));
    }
    function renderTextList() {} // deprecated, inline with categories
    async function selectText(textId) { if (!textId) return; hide(); await window.SessionManager?.loadText(textId); }
    async function openEditor(textId) { const mode = textId ? 'edit' : 'create'; let textData = null; if (textId) { const library = await loadLibrary(); textData = library.texts.find(t => t.id === textId); } window.ModalManager?.show('text-editor', { mode, text: textData, categories: state.library?.categories || [], selectedCategory: state.selectedCategory }); }
    async function saveText(textData) {
        if (!state.library) await loadLibrary();
        try {
            if (textData.categoryName && !textData.categoryId) { const newCat = { id: crypto.randomUUID(), name: textData.categoryName, icon: '📁' }; state.library.categories.push(newCat); textData.categoryId = newCat.id; }
            delete textData.categoryName;
            if (textData.id) { const idx = state.library.texts.findIndex(t => t.id === textData.id); if (idx >= 0) state.library.texts[idx] = textData; }
            else { textData.id = crypto.randomUUID(); textData.createdAt = new Date().toISOString(); state.library.texts.push(textData); }
            await saveLibrary(); await refresh(); return true;
        } catch (err) { console.error('Failed to save text:', err); if (window.ModalManager?.show) window.ModalManager.show('error', { message: err.message || 'Failed to save text' }); return false; }
    }
    async function deleteText(textId) { const text = state.library?.texts.find(t => t.id === textId); if (!text) return; const confirmed = await window.ModalManager.confirm({ title: 'Delete Text', message: `Delete "${text.title}"?\nThis action cannot be undone.`, confirmText: 'Delete', cancelText: 'Cancel' }); if (!confirmed) return; state.library.texts = state.library.texts.filter(t => t.id !== textId); await saveLibrary(); await refresh(); }
    async function deleteCategory(categoryId) { const category = state.library?.categories.find(c => c.id === categoryId); if (!category) return; const textsInCategory = state.library?.texts.filter(t => t.categoryId === categoryId) || []; const warningMsg = textsInCategory.length > 0 ? `Category "${category.name}" contains ${textsInCategory.length} text(s).\nTexts will become uncategorized.\n\nDelete category?` : `Delete category "${category.name}"?`; const confirmed = await window.ModalManager.confirm({ title: 'Delete Category', message: warningMsg, confirmText: 'Delete', cancelText: 'Cancel' }); if (!confirmed) return; state.library.texts.forEach(t => { if (t.categoryId === categoryId) t.categoryId = ''; }); state.library.categories = state.library.categories.filter(c => c.id !== categoryId); if (state.selectedCategory === categoryId) { state.selectedCategory = null; state.isExpanded = false; } await saveLibrary(); await refresh(); }
    async function refresh() { await loadLibrary(); renderCategories(); renderTextList(); }
    async function show() { const sidebar = getEl('library-sidebar'); if (!sidebar) return; if (!state.library) await loadLibrary(); renderCategories(); sidebar.classList.add('visible'); state.isVisible = true; }
    function hide() { const sidebar = getEl('library-sidebar'); if (sidebar) { sidebar.classList.remove('visible'); state.isVisible = false; } }
    function toggle() { state.isVisible ? hide() : show(); }
    function isVisible() { return state.isVisible; }
    function init() { getEl('library-toggle')?.addEventListener('click', e => { toggle(); e.currentTarget.blur(); }); getEl('text-add')?.addEventListener('click', e => { openEditor(null); e.currentTarget.blur(); }); getEl('topic-picker')?.addEventListener('click', e => { window.ModalManager?.show('topic-picker', {}); e.currentTarget.blur(); }); getEl('sidebar-close')?.addEventListener('click', hide); window.EventBus?.on('text:save', async data => { const success = await saveText(data); if (success) window.ModalManager?.hide(); }); }
    function getLibrary() { if (!state.library) loadLibrary(); return state.library; }
    window.LibraryManager = { init, show, hide, toggle, isVisible, refresh, selectText, openEditor, saveText, deleteText, deleteCategory, getLibrary };
})();
