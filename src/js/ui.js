// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers

/**
 * UI Manager module
 * Handles text rendering and stats updates
 */
(() => {
    if (!window.EventBus) { console.error('EventBus not available. Include events.js before ui.js'); return; }
    const textDisplay = document.getElementById('text-display');
    const textInput = document.getElementById('text-input');
    const statsBar = { wpm: document.getElementById('wpm'), cpm: document.getElementById('cpm'), accuracy: document.getElementById('accuracy'), timer: document.getElementById('timer') };
    let characterElements = []; let cursorIndex = 0; let suppressSelectionSync = false; let inputText = '';

    function ensureCursorVisible(index) {
        if (!textDisplay || characterElements.length === 0) return;
        const lastIndex = characterElements.length - 1;
        const targetIndex = index <= lastIndex ? Math.max(index, 0) : lastIndex;
        if (targetIndex < 0 || targetIndex > lastIndex) return;
        const target = characterElements[targetIndex];
        const containerRect = textDisplay.getBoundingClientRect(); const targetRect = target.getBoundingClientRect(); const padding = 12;
        const isAbove = targetRect.top < containerRect.top + padding; const isBelow = targetRect.bottom > containerRect.bottom - padding;
        if (!isAbove && !isBelow) return;
        requestAnimationFrame(() => target.scrollIntoView({ block: isAbove ? 'start' : 'end', inline: 'nearest', behavior: 'smooth' }));
    }

    function renderText(text) {
        if (!textDisplay) return; characterElements = []; cursorIndex = -1; textDisplay.innerHTML = '';
        const fragment = document.createDocumentFragment(); let lineStartIndex = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i]; const span = document.createElement('span'); span.className = 'char'; span.dataset.index = i;
            if (char === ' ') { const lockSpace = i === lineStartIndex + 1 && text[lineStartIndex] === '-'; span.textContent = lockSpace ? '\u00A0' : ' '; }
            else if (char === '\n') { span.textContent = ' \n'; }
            else if (char === '\r') { span.textContent = ''; }
            else { span.textContent = char; }
            characterElements.push(span); fragment.appendChild(span);
            if (char === '\n') lineStartIndex = i + 1;
        }
        textDisplay.appendChild(fragment);
        inputText = text; if (textInput) textInput.value = text;
        setCursorPosition(0, { emit: false });
        if (textInput) requestAnimationFrame(() => textInput.focus());
    }

    function setCursorPosition(index, { syncInput = true, emit = true } = {}) {
        const length = characterElements.length;
        if (length === 0) { cursorIndex = 0; if (syncInput && textInput && textInput.selectionStart !== 0) { suppressSelectionSync = true; textInput.setSelectionRange(0, 0); suppressSelectionSync = false; } if (emit) window.EventBus.emit('cursor:move', { index: 0 }); return; }
        const clamped = Math.max(0, Math.min(index, length));
        if (cursorIndex !== clamped) { if (cursorIndex >= 0 && cursorIndex < length) characterElements[cursorIndex].classList.remove('current'); if (clamped < length) characterElements[clamped].classList.add('current'); cursorIndex = clamped; ensureCursorVisible(clamped); }
        if (syncInput && textInput && textInput.selectionStart !== clamped) { suppressSelectionSync = true; textInput.setSelectionRange(clamped, clamped); suppressSelectionSync = false; }
        if (emit) window.EventBus.emit('cursor:move', { index: clamped });
    }

    if (textInput) {
        const scheduleCursorSync = () => requestAnimationFrame(() => { if (suppressSelectionSync) return; const pos = textInput.selectionStart; if (pos === null || pos === undefined) return; setCursorPosition(pos, { syncInput: false }); });
        textInput.addEventListener('select', () => { if (suppressSelectionSync) return; const pos = textInput.selectionStart; if (pos === null || pos === undefined) return; setCursorPosition(pos, { syncInput: false }); });
        textInput.addEventListener('keydown', e => { if (window.KeyUtils?.isNavigationKey?.(e.key)) scheduleCursorSync(); if (e.key === 'Tab') e.preventDefault(); });
        textInput.addEventListener('beforeinput', e => e.preventDefault());
        const restoreInput = () => { if (textInput.value === inputText) return; textInput.value = inputText; setCursorPosition(cursorIndex, { emit: false }); };
        textInput.addEventListener('compositionend', restoreInput);
        textInput.addEventListener('input', e => { if (!e.isComposing) restoreInput(); });
        textInput.addEventListener('contextmenu', e => e.preventDefault());
    }
    if (textDisplay) {
        textDisplay.addEventListener('mousedown', e => { const element = e.target instanceof Element ? e.target : null; const target = element?.closest('.char'); if (!target) { textInput?.focus(); setCursorPosition(characterElements.length, { syncInput: true }); return; } e.preventDefault(); const index = Number(target.dataset.index); textInput?.focus(); if (!Number.isNaN(index)) setCursorPosition(index, { syncInput: true }); });
        textDisplay.addEventListener('contextmenu', e => e.preventDefault());
    }

    function updateCharacter(index, state) { if (index < 0 || index >= characterElements.length) return; const charEl = characterElements[index]; switch (state) { case 'correct': charEl.classList.remove('error','current'); charEl.classList.add('typed','correct'); break; case 'error': charEl.classList.add('typed','error'); break; case 'current': charEl.classList.remove('error','typed','correct'); charEl.classList.add('current'); break; case 'fade-success': charEl.classList.remove('error','current'); charEl.classList.add('typed','correct','fade-success'); charEl.addEventListener('animationend', () => charEl.classList.remove('fade-success'), { once: true }); break; } }
    function showError(index) { updateCharacter(index, 'error'); }
    function updateStats(wpm, cpm, accuracy, time) { if (statsBar.wpm) statsBar.wpm.textContent = Math.round(wpm); if (statsBar.cpm) statsBar.cpm.textContent = Math.round(cpm); if (statsBar.accuracy) statsBar.accuracy.textContent = `${accuracy.toFixed(1)}%`; if (statsBar.timer) { const formatter = window.AppUtils?.formatTime; statsBar.timer.textContent = formatter ? formatter(time) : `${Math.floor(time ?? 0)}`; } }
    function showModal(type, data) { if (window.ModalManager) window.ModalManager.show(type, data); }
    function hideModal() { if (window.ModalManager) window.ModalManager.hide(); }
    window.EventBus.on('typing:keystroke', data => { if (data.index !== undefined) updateCharacter(data.index, 'correct'); });
    window.EventBus.on('cursor:sync', data => { if (typeof data.index === 'number') setCursorPosition(data.index, { syncInput: true, emit: false }); });
    window.EventBus.on('typing:error', data => { if (data.index !== undefined) showError(data.index); });
    window.EventBus.on('typing:backspace', data => { if (data.index !== undefined && characterElements[data.index]) characterElements[data.index].classList.remove('error','typed','correct'); });
    window.EventBus.on('stats:update', data => { updateStats(data.wpm, data.cpm, data.accuracy, data.time); });
    window.EventBus.on('typing:complete', data => { const currentIndex = data.currentIndex || characterElements.length; for (let i = 0; i < currentIndex; i++) if (!characterElements[i].classList.contains('typed')) updateCharacter(i, 'correct'); if (currentIndex < characterElements.length) characterElements[currentIndex].classList.remove('current'); data.isCompleted = true; showModal('session-summary', data); });
    window.UIManager = { renderText, updateCharacter, updateStats, showModal, hideModal, showError };
})();
