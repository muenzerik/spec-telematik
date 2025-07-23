// Compact Resizable Sidebars for PyData Sphinx Theme
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        COLLAPSE_THRESHOLD: 100,
        DEFAULT_LEFT_WIDTH: 300,
        DEFAULT_RIGHT_WIDTH: 250,
        RESIZER_WIDTH: 4,
        SCROLL_DEBOUNCE: 50,
        RESIZE_DEBOUNCE: 100
    };
    
    // Global state and elements
    let elements = {}, state = {}, scrollTimeout;
    
    // Utility functions
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);
    const debounce = (fn, delay) => (...args) => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => fn(...args), delay);
    };
    
    // CSS templates
    const getStyle = (type, side = '', width = CONFIG.RESIZER_WIDTH) => ({
        resizer: `position:fixed;width:${width}px;top:0;bottom:0;background:#ddd;cursor:ew-resize;z-index:10000;border-top:1px solid #ccc;border-left:none;border-right:none;border-bottom:none;box-sizing:border-box;margin:0;padding:0`,
        expandButton: `position:fixed;width:20px;${side}:0;top:0;bottom:0;background:var(--pst-color-surface,var(--bs-light,#f8f9fa));color:var(--pst-color-text-base,var(--bs-body-color,#212529));cursor:pointer;z-index:10001;display:none;align-items:center;justify-content:center;font-size:16px;font-weight:bold;opacity:0.9;transition:opacity 0.2s ease,transform 0.2s ease,filter 0.2s ease;border:1px solid var(--pst-color-border,var(--bs-border-color,#dee2e6))`
    }[type]);
    
    // Element creation with hover effects
    const createElement = (id, html, type, side) => {
        const el = document.createElement('div');
        Object.assign(el, { id, innerHTML: html || '' });
        el.style.cssText = getStyle(type, side);
        
        // Add hover effects for expand buttons
        if (type === 'expandButton') {
            ['mouseenter', 'mouseleave'].forEach((event, i) => {
                el.addEventListener(event, () => Object.assign(el.style, {
                    opacity: i ? '0.9' : '1',
                    transform: i ? 'scale(1)' : 'scale(1.1, 1.05)',
                    filter: i ? 'brightness(1)' : 'brightness(0.9)'
                }));
            });
        }
        
        document.body.appendChild(el);
        return el;
    };
    
    // Initialize elements
    const initElements = () => {
        const selectors = {
            leftSidebar: '.bd-sidebar',
            rightSidebar: '.bd-toc',
            mainContent: '.bd-main',
            navbar: '.bd-header',
            footer: '.bd-footer'
        };
        
        Object.keys(selectors).forEach(key => elements[key] = $(selectors[key]));
        
        if (!elements.leftSidebar || !elements.mainContent) {
            console.log('Required sidebar elements not found');
            return false;
        }
        
        // Create UI elements
        elements.leftResizer = createElement('left-sidebar-resizer', '', 'resizer');
        elements.leftExpandButton = createElement('left-expand-button', '&gt;&gt;', 'expandButton', 'left');
        
        if (elements.rightSidebar) {
            elements.rightResizer = createElement('right-sidebar-resizer', '', 'resizer');
            elements.rightExpandButton = createElement('right-expand-button', '&lt;&lt;', 'expandButton', 'right');
        }
        
        state = { isResizingLeft: false, isResizingRight: false };
        return true;
    };
    
    // Apply sidebar content styles (optimized)
    const applySidebarStyles = (sidebar, width) => {
        if (!sidebar) return;
        
        // Style main containers
        const containers = ['.bd-sidebar__content', '.sidebar-primary-items__start', '.search-button__wrapper', '.bd-toc', '.bd-sidenav', '.bd-toc__content', '.bd-toc-nav', 'nav.bd-toc'];
        containers.forEach(sel => {
            const el = sidebar.querySelector(sel);
            if (el) Object.assign(el.style, { width: width + 'px', maxWidth: width + 'px', overflowX: 'hidden', boxSizing: 'border-box' });
        });
        
        // Apply to all children (batched for performance)
        const fragment = document.createDocumentFragment();
        sidebar.querySelectorAll('*').forEach(el => {
            const { position } = getComputedStyle(el);
            if (position === 'absolute' || position === 'fixed') return;
            
            const tag = el.tagName.toLowerCase();
            const baseStyles = { maxWidth: '100%', boxSizing: 'border-box' };
            
            if (['div', 'ul', 'ol', 'li', 'p', 'span', 'a', 'form'].includes(tag)) {
                Object.assign(baseStyles, { wordWrap: 'break-word', overflowWrap: 'break-word' });
            } else if (['input', 'button', 'select'].includes(tag)) {
                baseStyles.width = 'auto';
            } else if (tag === 'table') {
                Object.assign(baseStyles, { tableLayout: 'fixed', width: '100%' });
            } else if (['pre', 'code'].includes(tag)) {
                Object.assign(baseStyles, { whiteSpace: 'pre-wrap', wordBreak: 'break-all' });
            } else if (tag === 'img') {
                baseStyles.height = 'auto';
            }
            
            Object.assign(el.style, baseStyles);
        });
        
        Object.assign(sidebar.style, { overflowX: 'hidden', overflowY: 'auto' });
    };
    
    // Get layout positions
    const getPositions = () => {
        const topPosition = elements.navbar?.offsetHeight || 0;
        let bottomPosition = 0;
        
        if (elements.footer) {
            const rect = elements.footer.getBoundingClientRect();
            const winHeight = window.innerHeight;
            if (rect.top < winHeight && rect.bottom > 0) {
                const overlap = Math.min(winHeight, rect.bottom) - Math.max(0, rect.top);
                if (overlap > 0) bottomPosition = Math.min(overlap, elements.footer.offsetHeight);
            }
        }
        
        return { topPosition, bottomPosition };
    };
    
    // Update single sidebar (unified function)
    const updateSidebar = (config) => {
        const { sidebar, resizer, expandButton, width, isLeft, positions } = config;
        const { topPosition, bottomPosition } = positions;
        const collapsed = width < CONFIG.COLLAPSE_THRESHOLD;
        const side = isLeft ? 'left' : 'right';
        
        if (collapsed) {
            sidebar.style.display = 'none';
            resizer.style.display = 'none';
            Object.assign(expandButton.style, { display: 'flex', top: topPosition + 'px', bottom: bottomPosition + 'px' });
            return 0;
        }
        
        Object.assign(sidebar.style, {
            display: 'block', position: 'fixed', [side]: '0px',
            top: topPosition + 'px', bottom: bottomPosition + 'px',
            height: 'auto', width: width + 'px'
        });
        
        Object.assign(resizer.style, {
            display: 'block', [side]: width + 'px',
            top: topPosition + 'px', bottom: bottomPosition + 'px'
        });
        
        expandButton.style.display = 'none';
        applySidebarStyles(sidebar, width);
        return width;
    };
    
    // Main layout update
    const updateLayout = (leftWidth, rightWidth = null) => {
        if (!elements.leftSidebar || !elements.mainContent) return;
        
        const positions = getPositions();
        const actualLeftWidth = updateSidebar({
            sidebar: elements.leftSidebar, resizer: elements.leftResizer, 
            expandButton: elements.leftExpandButton, width: leftWidth, isLeft: true, positions
        });
        
        const actualRightWidth = elements.rightSidebar && rightWidth ? updateSidebar({
            sidebar: elements.rightSidebar, resizer: elements.rightResizer,
            expandButton: elements.rightExpandButton, width: rightWidth, isLeft: false, positions
        }) : 0;
        
        Object.assign(elements.mainContent.style, {
            marginLeft: actualLeftWidth + 'px',
            marginRight: actualRightWidth + 'px'
        });
        
        // Update article containers
        ['article', 'article-container', 'container-fluid', 'container__inner.bd-page-width'].forEach(cls => {
            const el = $(`.bd-${cls.replace('__', '__').replace('.bd-', '.')}`);
            if (el) Object.assign(el.style, {
                marginLeft: '0px', marginRight: '0px',
                paddingLeft: cls.includes('container') ? '1rem' : '0px',
                paddingRight: cls.includes('container') ? '1rem' : '0px',
                maxWidth: 'none', width: '100%'
            });
        });
    };
    
    // Event setup (optimized)
    const setupEvents = () => {
        // Unified mouse handler
        const createHandler = (isLeft) => {
            const resizer = elements[isLeft ? 'leftResizer' : 'rightResizer'];
            const expandButton = elements[isLeft ? 'leftExpandButton' : 'rightExpandButton'];
            const stateKey = isLeft ? 'isResizingLeft' : 'isResizingRight';
            
            [resizer, expandButton].forEach(el => {
                el.addEventListener('mousedown', (e) => {
                    state[stateKey] = true;
                    if (el === resizer) resizer.style.background = '#999';
                    Object.assign(document.body.style, { cursor: 'ew-resize', userSelect: 'none' });
                    e.preventDefault();
                });
            });
        };
        
        createHandler(true);
        if (elements.rightResizer) createHandler(false);
        
        // Mouse events
        document.addEventListener('mousemove', (e) => {
            if (state.isResizingLeft) {
                updateLayout(Math.max(0, Math.min(600, e.clientX)), elements.rightSidebar?.offsetWidth);
            }
            if (state.isResizingRight && elements.rightSidebar) {
                updateLayout(elements.leftSidebar.offsetWidth, Math.max(0, Math.min(500, window.innerWidth - e.clientX)));
            }
        });
        
        document.addEventListener('mouseup', () => {
            ['Left', 'Right'].forEach(side => {
                const key = `isResizing${side}`;
                if (state[key]) {
                    const sidebarKey = `${side.toLowerCase()}Sidebar`;
                    const resizerKey = `${side.toLowerCase()}Resizer`;
                    localStorage.setItem(`${side.toLowerCase()}SidebarWidth`, elements[sidebarKey].offsetWidth || 0);
                    state[key] = false;
                    if (elements[resizerKey]?.style.display !== 'none') {
                        elements[resizerKey].style.background = '#ddd';
                    }
                }
            });
            Object.assign(document.body.style, { cursor: '', userSelect: '' });
        });
        
        // Click handlers with timeout
        let clickTimeout;
        const addClickHandler = (button, isLeft) => {
            button.addEventListener('click', () => {
                clearTimeout(clickTimeout);
                clickTimeout = setTimeout(() => {
                    if (!state[isLeft ? 'isResizingLeft' : 'isResizingRight']) {
                        const width = CONFIG[isLeft ? 'DEFAULT_LEFT_WIDTH' : 'DEFAULT_RIGHT_WIDTH'];
                        updateLayout(
                            isLeft ? width : elements.leftSidebar.offsetWidth,
                            isLeft ? (elements.rightSidebar?.offsetWidth || null) : width
                        );
                        localStorage.setItem(`${isLeft ? 'left' : 'right'}SidebarWidth`, width);
                    }
                }, 50);
            });
        };
        
        addClickHandler(elements.leftExpandButton, true);
        if (elements.rightExpandButton) addClickHandler(elements.rightExpandButton, false);
        
        // Scroll/resize handlers
        const debouncedUpdate = debounce(() => {
            if (!elements.leftSidebar) return;
            const leftWidth = elements.leftSidebar.offsetWidth || 0;
            const rightWidth = elements.rightSidebar?.offsetWidth || null;
            if (leftWidth >= CONFIG.COLLAPSE_THRESHOLD || (rightWidth && rightWidth >= CONFIG.COLLAPSE_THRESHOLD)) {
                updateLayout(leftWidth, rightWidth);
            }
        }, CONFIG.SCROLL_DEBOUNCE);
        
        window.addEventListener('scroll', debouncedUpdate);
        window.addEventListener('resize', debounce(debouncedUpdate, CONFIG.RESIZE_DEBOUNCE));
    };
    
    // Initialize
    const init = () => {
        if (!initElements()) return;
        setupEvents();
        
        setTimeout(() => {
            const leftWidth = parseInt(localStorage.getItem('leftSidebarWidth')) || 
                             elements.leftSidebar.offsetWidth || CONFIG.DEFAULT_LEFT_WIDTH;
            const rightWidth = elements.rightSidebar ? 
                              (parseInt(localStorage.getItem('rightSidebarWidth')) || 
                               elements.rightSidebar.offsetWidth || CONFIG.DEFAULT_RIGHT_WIDTH) : null;
            
            updateLayout(leftWidth, rightWidth);
            console.log('Resizable sidebars initialized');
        }, 200);
    };
    
    // Start
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
