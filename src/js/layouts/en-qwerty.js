// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers
(() => { window.LAYOUT_EN_QWERTY = {
    id: 'en-qwerty', name: 'English (QWERTY)', language: 'en',
    rows: [
        [{ key: '`', label: ['~', '`'] }, { key: '1', label: ['!', '1'] }, { key: '2', label: ['@', '2'] }, { key: '3', label: ['#', '3'] }, { key: '4', label: ['$', '4'] }, { key: '5', label: ['%', '5'] }, { key: '6', label: ['^', '6'] }, { key: '7', label: ['&', '7'] }, { key: '8', label: ['*', '8'] }, { key: '9', label: ['(', '9'] }, { key: '0', label: [')', '0'] }, { key: '-', label: ['_', '-'] }, { key: '=', label: ['+', '='] }, { key: 'Backspace', label: 'Backspace', className: 'key-wide' }],
        [{ key: 'Tab', label: 'Tab', className: 'key-wide' }, { key: 'q', label: 'Q' }, { key: 'w', label: 'W' }, { key: 'e', label: 'E' }, { key: 'r', label: 'R' }, { key: 't', label: 'T' }, { key: 'y', label: 'Y' }, { key: 'u', label: 'U' }, { key: 'i', label: 'I' }, { key: 'o', label: 'O' }, { key: 'p', label: 'P' }, { key: '[', label: ['{', '['] }, { key: ']', label: ['}', ']'] }, { key: '\\', label: ['|', '\\'], className: 'key-wide' }],
        [{ key: 'CapsLock', label: 'Caps', className: 'key-wider' }, { key: 'a', label: 'A' }, { key: 's', label: 'S' }, { key: 'd', label: 'D' }, { key: 'f', label: 'F' }, { key: 'g', label: 'G' }, { key: 'h', label: 'H' }, { key: 'j', label: 'J' }, { key: 'k', label: 'K' }, { key: 'l', label: 'L' }, { key: ';', label: [':', ';'] }, { key: "'", label: ['"', "'"] }, { key: 'Enter', label: 'Enter', className: 'key-wider' }],
        [{ key: 'Shift', label: 'Shift', className: 'key-widest' }, { key: 'z', label: 'Z' }, { key: 'x', label: 'X' }, { key: 'c', label: 'C' }, { key: 'v', label: 'V' }, { key: 'b', label: 'B' }, { key: 'n', label: 'N' }, { key: 'm', label: 'M' }, { key: ',', label: ['<', ','] }, { key: '.', label: ['>', '.'] }, { key: '/', label: ['?', '/'] }, { key: 'Shift', label: 'Shift', className: 'key-widest' }],
        [{ key: ' ', label: 'Space', className: 'key-space' }],
    ],
    fingerMap: {
        '`': 'left-pinky', '1': 'left-pinky', 'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky', 'Tab': 'left-pinky', 'CapsLock': 'left-pinky',
        '2': 'left-ring', 'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
        '3': 'left-middle', 'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
        '4': 'left-index', '5': 'left-index', 'r': 'left-index', 't': 'left-index', 'f': 'left-index', 'g': 'left-index', 'v': 'left-index', 'b': 'left-index',
        '~': 'left-pinky', '!': 'left-pinky', '@': 'left-ring', '#': 'left-middle', '$': 'left-index', '%': 'left-index',
        '6': 'right-index', '7': 'right-index', 'y': 'right-index', 'u': 'right-index', 'h': 'right-index', 'j': 'right-index', 'n': 'right-index', 'm': 'right-index',
        '8': 'right-middle', 'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle',
        '9': 'right-ring', 'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',
        '0': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky', 'p': 'right-pinky', ';': 'right-pinky', '/': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky', '\\': 'right-pinky', 'Backspace': 'right-pinky', 'Enter': 'right-pinky', "'": 'right-pinky',
        '^': 'right-index', '&': 'right-index', '*': 'right-middle', '(': 'right-ring', ')': 'right-pinky', '_': 'right-pinky', '+': 'right-pinky', '{': 'right-pinky', '}': 'right-pinky', '|': 'right-pinky', ':': 'right-pinky', '"': 'right-pinky', '<': 'right-middle', '>': 'right-ring', '?': 'right-pinky',
        ' ': 'thumb',
    },
    leftHandKeys: new Set(['`','~','1','!','2','@','3','#','4','$','5','%','q','Q','w','W','e','E','r','R','t','T','a','A','s','S','d','D','f','F','g','G','z','Z','x','X','c','C','v','V','b','B','Tab','CapsLock']),
    shiftToBaseKey: { '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/' },
}; })();
