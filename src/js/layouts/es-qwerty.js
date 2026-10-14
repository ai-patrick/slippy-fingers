// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers
(() => { window.LAYOUT_ES_QWERTY = {
    id: 'es-qwerty', name: 'Español (España)', language: 'es',
    rows: [
        [{ key: 'º', label: ['ª', 'º'] }, { key: '1', label: ['!', '1'] }, { key: '2', label: ['"', '2'] }, { key: '3', label: ['·', '3'] }, { key: '4', label: ['$', '4'] }, { key: '5', label: ['%', '5'] }, { key: '6', label: ['&', '6'] }, { key: '7', label: ['/', '7'] }, { key: '8', label: ['(', '8'] }, { key: '9', label: [')', '9'] }, { key: '0', label: ['=', '0'] }, { key: "'", label: ['?', "'"] }, { key: '¡', label: ['¿', '¡'] }, { key: 'Backspace', label: 'Backspace', className: 'key-wide' }],
        [{ key: 'Tab', label: 'Tab', className: 'key-wide' }, { key: 'q', label: 'Q' }, { key: 'w', label: 'W' }, { key: 'e', label: 'E' }, { key: 'r', label: 'R' }, { key: 't', label: 'T' }, { key: 'y', label: 'Y' }, { key: 'u', label: 'U' }, { key: 'i', label: 'I' }, { key: 'o', label: 'O' }, { key: 'p', label: 'P' }, { key: '`', label: ['^', '`'] }, { key: '+', label: ['*', '+'] }, { key: 'ç', label: ['Ç', 'ç'], className: 'key-wide' }],
        [{ key: 'CapsLock', label: 'Caps', className: 'key-wider' }, { key: 'a', label: 'A' }, { key: 's', label: 'S' }, { key: 'd', label: 'D' }, { key: 'f', label: 'F' }, { key: 'g', label: 'G' }, { key: 'h', label: 'H' }, { key: 'j', label: 'J' }, { key: 'k', label: 'K' }, { key: 'l', label: 'L' }, { key: 'ñ', label: 'Ñ' }, { key: '´', label: ['¨', '´'] }, { key: 'Enter', label: 'Enter', className: 'key-wider' }],
        [{ key: 'Shift', label: 'Shift', className: 'key-iso-shift' }, { key: '<', label: ['>', '<'] }, { key: 'z', label: 'Z' }, { key: 'x', label: 'X' }, { key: 'c', label: 'C' }, { key: 'v', label: 'V' }, { key: 'b', label: 'B' }, { key: 'n', label: 'N' }, { key: 'm', label: 'M' }, { key: ',', label: [';', ','] }, { key: '.', label: [':', '.'] }, { key: '-', label: ['_', '-'] }, { key: 'Shift', label: 'Shift', className: 'key-widest' }],
        [{ key: ' ', label: 'Space', className: 'key-space' }],
    ],
    fingerMap: {
        'º': 'left-pinky', 'ª': 'left-pinky', '1': 'left-pinky', '!': 'left-pinky', 'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky', '<': 'left-pinky', '>': 'left-pinky', 'Tab': 'left-pinky', 'CapsLock': 'left-pinky',
        '2': 'left-ring', '"': 'left-ring', 'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
        '3': 'left-middle', '·': 'left-middle', 'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
        '4': 'left-index', '$': 'left-index', '5': 'left-index', '%': 'left-index', 'r': 'left-index', 't': 'left-index', 'f': 'left-index', 'g': 'left-index', 'v': 'left-index', 'b': 'left-index',
        '6': 'right-index', '&': 'right-index', '7': 'right-index', '/': 'right-index', 'y': 'right-index', 'u': 'right-index', 'h': 'right-index', 'j': 'right-index', 'n': 'right-index',
        '8': 'right-middle', '(': 'right-middle', 'i': 'right-middle', 'k': 'right-middle', 'm': 'right-index', ',': 'right-middle',
        '9': 'right-ring', ')': 'right-ring', 'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',
        '0': 'right-pinky', '=': 'right-pinky', 'p': 'right-pinky', '`': 'right-pinky', '^': 'right-pinky', '´': 'right-pinky', '¨': 'right-pinky', '+': 'right-pinky', '*': 'right-pinky', "'": 'right-pinky', '?': 'right-pinky', '¿': 'right-pinky', '¡': 'right-pinky', 'ñ': 'right-pinky', 'Ñ': 'right-pinky', 'ç': 'right-pinky', 'Ç': 'right-pinky', '-': 'right-pinky', '_': 'right-pinky', ';': 'right-middle', ':': 'right-ring', 'Backspace': 'right-pinky', 'Enter': 'right-pinky',
        ' ': 'thumb',
    },
    leftHandKeys: new Set(['º','ª','1','!','2','"','3','·','4','$','5','%','q','Q','w','W','e','E','r','R','t','T','a','A','s','S','d','D','f','F','g','G','<','>','z','Z','x','X','c','C','v','V','b','B','Tab','CapsLock']),
    shiftToBaseKey: { 'ª': 'º', '!': '1', '"': '2', '·': '3', '$': '4', '%': '5', '&': '6', '/': '7', '(': '8', ')': '9', '=': '0', '?': "'", '¿': '¡', '^': '`', '¨': '´', '*': '+', 'Ç': 'ç', '>': '<', ';': ',', ':': '.', '_': '-' },
    deadKeys: { '\u0301': '´', '\u0308': '¨', '\u0300': '`', '\u0302': '^' },
}; })();
