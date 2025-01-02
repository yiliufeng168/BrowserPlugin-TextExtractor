// ==UserScript==
// @name         Mouse Move Text Extractor with Highlight and Selectable Text (Command + Shift)
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Extract text content from elements on mouse hover when Command + Shift key is pressed, with highlight and selectable text
// @author       You
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 添加左上角和左下角展示区域的样式
    GM_addStyle(`
        #mouse-text-overlay {
            position: fixed;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px;
            font-size: 18px;
            border-radius: 5px;
            z-index: 9999;
            pointer-events: auto; /* 允许选择文本 */
            user-select: text; /* 使文本可选 */
        }
        .highlighted-element {
            background-color: rgba(255, 255, 0, 0.5); /* 高亮背景色 */
        }
    `);

    // 创建一个用于展示文本的 div
    const overlay = document.createElement('div');
    overlay.id = 'mouse-text-overlay';
    document.body.appendChild(overlay);

    let listening = false;
    let currentHighlightedElement = null;

    // 监听 Command 和 Shift 键的按下和松开事件
    let commandPressed = false;
    let shiftPressed = false;

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Meta') {  // 'Meta' 键对应 Command 键
            commandPressed = true;
        }
        if (event.key === 'Shift') {
            shiftPressed = true;
        }

        if (commandPressed && shiftPressed) {  // Command + Shift 同时按下时开始监听
            listening = true;
            overlay.style.display = 'block';  // 显示 overlay
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'Meta') {
            commandPressed = false;
        }
        if (event.key === 'Shift') {
            shiftPressed = false;
        }

        if (!(commandPressed && shiftPressed)) {  // Command 或 Shift 键松开时停止监听
            listening = false;
            // 不隐藏 overlay，保持文本显示
        }
    });

    // 鼠标移动监听，只有在监听状态时有效
    document.addEventListener('mousemove', (event) => {
        if (listening) {
            const element = document.elementFromPoint(event.clientX, event.clientY);
            if (element) {
                const textContent = element.textContent || element.innerText || '';  // 获取文本内容
                overlay.textContent = textContent.trim().substring(0, 500);  // 截取前100个字符显示

                // 高亮当前元素
                if (currentHighlightedElement && currentHighlightedElement !== element) {
                    currentHighlightedElement.classList.remove('highlighted-element');
                }
                element.classList.add('highlighted-element');
                currentHighlightedElement = element;

                // 计算并调整显示位置
                const rect = element.getBoundingClientRect();
                const overlayWidth = overlay.offsetWidth;
                const overlayHeight = overlay.offsetHeight;

                // 如果元素靠近左上角，展示文本区域在左下角
                if (rect.top < overlayHeight && rect.left < overlayWidth) {
                    overlay.style.top = 'auto';
                    overlay.style.bottom = '10px';  // 放置在左下角
                    overlay.style.left = '10px';    // 距离页面左侧 10px
                } else {
                    overlay.style.top = '10px';     // 放置在左上角
                    overlay.style.bottom = 'auto';
                    overlay.style.left = '10px';    // 距离页面左侧 10px
                }
            }
        }
    });

    // 监听鼠标离开事件，取消高亮
    document.addEventListener('mouseout', () => {
        if (currentHighlightedElement) {
            currentHighlightedElement.classList.remove('highlighted-element');
            currentHighlightedElement = null;
        }
    });
})();