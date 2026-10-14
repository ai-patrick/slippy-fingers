// Copyright 2025 Asher Buk (original FingerGo)
// Copyright 2025 Slippy Fingers Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/go-pato/slippy-fingers
(() => { window.LAYOUT_RU_JCUKEN = {
    id: 'ru-jcuken', name: 'Русский (ЙЦУКЕН)', language: 'ru',
    rows: [
        [{ key: 'ё', label: ['Ё', 'ё'] }, { key: '1', label: ['!', '1'] }, { key: '2', label: ['"', '2'] }, { key: '3', label: ['№', '3'] }, { key: '4', label: [';', '4'] }, { key: '5', label: ['%', '5'] }, { key: '6', label: [':', '6'] }, { key: '7', label: ['?', '7'] }, { key: '8', label: ['*', '8'] }, { key: '9', label: ['(', '9'] }, { key: '0', label: [')', '0'] }, { key: '-', label: ['_', '-'] }, { key: '=', label: ['+', '='] }, { key: 'Backspace', label: 'Backspace', className: 'key-wide' }],
        [{ key: 'Tab', label: 'Tab', className: 'key-wide' }, { key: 'й', label: 'Й' }, { key: 'ц', label: 'Ц' }, { key: 'у', label: 'У' }, { key: 'к', label: 'К' }, { key: 'е', label: 'Е' }, { key: 'н', label: 'Н' }, { key: 'г', label: 'Г' }, { key: 'ш', label: 'Ш' }, { key: 'щ', label: 'Щ' }, { key: 'з', label: 'З' }, { key: 'х', label: 'Х' }, { key: 'ъ', label: 'Ъ' }, { key: '\\', label: ['/', '\\'], className: 'key-wide' }],
        [{ key: 'CapsLock', label: 'Caps', className: 'key-wider' }, { key: 'ф', label: 'Ф' }, { key: 'ы', label: 'Ы' }, { key: 'в', label: 'В' }, { key: 'а', label: 'А' }, { key: 'п', label: 'П' }, { key: 'р', label: 'Р' }, { key: 'о', label: 'О' }, { key: 'л', label: 'Л' }, { key: 'д', label: 'Д' }, { key: 'ж', label: 'Ж' }, { key: 'э', label: 'Э' }, { key: 'Enter', label: 'Enter', className: 'key-wider' }],
        [{ key: 'Shift', label: 'Shift', className: 'key-widest' }, { key: 'я', label: 'Я' }, { key: 'ч', label: 'Ч' }, { key: 'с', label: 'С' }, { key: 'м', label: 'М' }, { key: 'и', label: 'И' }, { key: 'т', label: 'Т' }, { key: 'ь', label: 'Ь' }, { key: 'б', label: 'Б' }, { key: 'ю', label: 'Ю' }, { key: '.', label: [',', '.'] }, { key: 'Shift', label: 'Shift', className: 'key-widest' }],
        [{ key: ' ', label: 'Space', className: 'key-space' }],
    ],
    fingerMap: {
        'ё': 'left-pinky', '1': 'left-pinky', 'й': 'left-pinky', 'ф': 'left-pinky', 'я': 'left-pinky', 'Tab': 'left-pinky', 'CapsLock': 'left-pinky',
        '2': 'left-ring', 'ц': 'left-ring', 'ы': 'left-ring', 'ч': 'left-ring',
        '3': 'left-middle', 'у': 'left-middle', 'в': 'left-middle', 'с': 'left-middle',
        '4': 'left-index', '5': 'left-index', 'к': 'left-index', 'е': 'left-index', 'а': 'left-index', 'п': 'left-index', 'м': 'left-index', 'и': 'left-index',
        'Ё': 'left-pinky', '!': 'left-pinky', '"': 'left-ring', '№': 'left-middle', ';': 'left-index', '%': 'left-index',
        '6': 'right-index', '7': 'right-index', 'н': 'right-index', 'г': 'right-index', 'р': 'right-index', 'о': 'right-index', 'т': 'right-index', 'ь': 'right-index',
        '8': 'right-middle', 'ш': 'right-middle', 'л': 'right-middle', 'б': 'right-middle',
        '9': 'right-ring', 'щ': 'right-ring', 'д': 'right-ring', 'ю': 'right-ring',
        '0': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky', 'з': 'right-pinky', 'х': 'right-pinky', 'ъ': 'right-pinky', '\\': 'right-pinky', 'ж': 'right-pinky', 'э': 'right-pinky', '.': 'right-pinky', 'Backspace': 'right-pinky', 'Enter': 'right-pinky',
        ':': 'right-index', '?': 'right-index', '*': 'right-middle', '(': 'right-ring', ')': 'right-pinky', '_': 'right-pinky', '+': 'right-pinky', '/': 'right-pinky', ',': 'right-pinky',
        ' ': 'thumb',
    },
    leftHandKeys: new Set(['ё','Ё','1','!','2','"','3','№','4',';','5','%','й','Й','ц','Ц','у','У','к','К','е','Е','ф','Ф','ы','Ы','в','В','а','А','п','П','я','Я','ч','Ч','с','С','м','М','и','И','Tab','CapsLock']),
    shiftToBaseKey: { 'Ё': 'ё', '!': '1', '"': '2', '№': '3', ';': '4', '%': '5', ':': '6', '?': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=', '/': '\\', ',': '.' },
}; })();
