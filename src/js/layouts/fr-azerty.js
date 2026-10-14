// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers
(() => { window.LAYOUT_FR_AZERTY = {
    id: 'fr-azerty', name: 'Français (AZERTY)', language: 'fr',
    rows: [
        [{ key: '²', label: '²' }, { key: '&', label: ['1', '&'] }, { key: 'é', label: ['2', 'é'] }, { key: '"', label: ['3', '"'] }, { key: "'", label: ['4', "'"] }, { key: '(', label: ['5', '('] }, { key: '-', label: ['6', '-'] }, { key: 'è', label: ['7', 'è'] }, { key: '_', label: ['8', '_'] }, { key: 'ç', label: ['9', 'ç'] }, { key: 'à', label: ['0', 'à'] }, { key: ')', label: ['°', ')'] }, { key: '=', label: ['+', '='] }, { key: 'Backspace', label: 'Backspace', className: 'key-wide' }],
        [{ key: 'Tab', label: 'Tab', className: 'key-wide' }, { key: 'a', label: 'A' }, { key: 'z', label: 'Z' }, { key: 'e', label: 'E' }, { key: 'r', label: 'R' }, { key: 't', label: 'T' }, { key: 'y', label: 'Y' }, { key: 'u', label: 'U' }, { key: 'i', label: 'I' }, { key: 'o', label: 'O' }, { key: 'p', label: 'P' }, { key: '^', label: ['¨', '^'] }, { key: '$', label: ['£', '$'] }, { key: '*', label: ['µ', '*'], className: 'key-wide' }],
        [{ key: 'CapsLock', label: 'Caps', className: 'key-wider' }, { key: 'q', label: 'Q' }, { key: 's', label: 'S' }, { key: 'd', label: 'D' }, { key: 'f', label: 'F' }, { key: 'g', label: 'G' }, { key: 'h', label: 'H' }, { key: 'j', label: 'J' }, { key: 'k', label: 'K' }, { key: 'l', label: 'L' }, { key: 'm', label: 'M' }, { key: 'ù', label: ['%', 'ù'] }, { key: 'Enter', label: 'Enter', className: 'key-wider' }],
        [{ key: 'Shift', label: 'Shift', className: 'key-iso-shift' }, { key: '<', label: ['>', '<'] }, { key: 'w', label: 'W' }, { key: 'x', label: 'X' }, { key: 'c', label: 'C' }, { key: 'v', label: 'V' }, { key: 'b', label: 'B' }, { key: 'n', label: 'N' }, { key: ',', label: ['?', ','] }, { key: ';', label: ['.', ';'] }, { key: ':', label: ['/', ':'] }, { key: '!', label: ['§', '!'] }, { key: 'Shift', label: 'Shift', className: 'key-widest' }],
        [{ key: ' ', label: 'Space', className: 'key-space' }],
    ],
    fingerMap: {
        '²': 'left-pinky', '&': 'left-pinky', 'a': 'left-pinky', 'q': 'left-pinky', '<': 'left-pinky', 'w': 'left-pinky', 'Tab': 'left-pinky', 'CapsLock': 'left-pinky',
        'é': 'left-ring', 'z': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
        '"': 'left-middle', 'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
        "'": 'left-index', '(': 'left-index', 'r': 'left-index', 't': 'left-index', 'f': 'left-index', 'g': 'left-index', 'v': 'left-index', 'b': 'left-index',
        '1': 'left-pinky', '>': 'left-pinky', '2': 'left-ring', '3': 'left-middle', '4': 'left-index', '5': 'left-index',
        '-': 'right-index', 'è': 'right-index', 'y': 'right-index', 'u': 'right-index', 'h': 'right-index', 'j': 'right-index', 'n': 'right-index', ',': 'right-index',
        '_': 'right-middle', 'i': 'right-middle', 'k': 'right-middle', ';': 'right-middle',
        'ç': 'right-ring', 'o': 'right-ring', 'l': 'right-ring', ':': 'right-ring',
        'à': 'right-pinky', ')': 'right-pinky', '=': 'right-pinky', 'p': 'right-pinky', '^': 'right-pinky', '$': 'right-pinky', '*': 'right-pinky', 'm': 'right-pinky', 'ù': 'right-pinky', '!': 'right-pinky', 'Backspace': 'right-pinky', 'Enter': 'right-pinky',
        '6': 'right-index', '7': 'right-index', '?': 'right-index', '8': 'right-middle', '.': 'right-middle', '9': 'right-ring', '/': 'right-ring', '0': 'right-pinky', '°': 'right-pinky', '+': 'right-pinky', '¨': 'right-pinky', '£': 'right-pinky', 'µ': 'right-pinky', '%': 'right-pinky', '§': 'right-pinky',
        ' ': 'thumb',
    },
    leftHandKeys: new Set(['²','&','1','é','2','"','3',"'",'4','(','5','a','A','z','Z','e','E','r','R','t','T','q','Q','s','S','d','D','f','F','g','G','<','>','w','W','x','X','c','C','v','V','b','B','Tab','CapsLock']),
    shiftToBaseKey: { '1': '&', '2': 'é', '3': '"', '4': "'", '5': '(', '6': '-', '7': 'è', '8': '_', '9': 'ç', '0': 'à', '°': ')', '+': '=', '¨': '^', '£': '$', 'µ': '*', '%': 'ù', '?': ',', '.': ';', '/': ':', '§': '!', '>': '<' },
    deadKeys: { '\u0302': '^', '\u0308': '¨' },
}; })();
