// custom.js
document.addEventListener('DOMContentLoaded', function () {
    // Select sidebar for sphinx_rtd_theme
    const sidebar = document.querySelector('.wy-nav-side');
    const mainContent = document.querySelector('.wy-nav-content-wrap');
    if (!sidebar || !mainContent) return;

    // Create resizer
    let resizer = document.createElement('div');
    resizer.id = 'sidebar-resizer';
    document.body.appendChild(resizer);

    // Function to update layout
    function updateLayout(width) {
        sidebar.style.width = width + 'px';
        mainContent.style.marginLeft = width + 'px';
        resizer.style.left = width + 'px';
        
        // Also resize the sidebar content elements
        const sidebarContent = sidebar.querySelector('.wy-side-scroll');
        const sidebarNav = sidebar.querySelector('.wy-menu');
        const sidebarSearch = sidebar.querySelector('.wy-side-nav-search');
        
        if (sidebarContent) {
            sidebarContent.style.width = width + 'px';
        }
        if (sidebarNav) {
            sidebarNav.style.width = width + 'px';
        }
        if (sidebarSearch) {
            sidebarSearch.style.width = width + 'px';
            // Also resize the search input if it exists
            const searchInput = sidebarSearch.querySelector('input[type="text"]');
            if (searchInput) {
                searchInput.style.width = (width - 40) + 'px'; // Account for padding
            }
        }
    }

    // Set initial width from localStorage if available
    let storedWidth = localStorage.getItem('sidebarWidth');
    if (storedWidth) {
        updateLayout(parseInt(storedWidth));
    }

    let isResizing = false;

    resizer.addEventListener('mousedown', function(e) {
        isResizing = true;
        resizer.classList.add('active');
        document.body.style.cursor = 'ew-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        let newWidth = e.clientX;
        if (newWidth < 150) newWidth = 150; // min width
        if (newWidth > 500) newWidth = 500; // max width
        updateLayout(newWidth);
    });

    document.addEventListener('mouseup', function(e) {
        if (isResizing) {
            localStorage.setItem('sidebarWidth', sidebar.offsetWidth);
        }
        isResizing = false;
        resizer.classList.remove('active');
        document.body.style.cursor = '';
    });
});
