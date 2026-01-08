document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('custom-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleBtn = document.querySelector('.ma5menu__toggle');
    const closeBtn = document.getElementById('close-sidebar');

    // Toggle Sidebar
    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }

    if (toggleBtn) {
        // We override the existing click behavior if ma5menu was using it
        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openSidebar();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Handle Submenu Toggle (e.g., "Features")
    const parentLinks = document.querySelectorAll('.parent-link');
    parentLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('open');

            // Close other same-level submenus if needed (optional)
            /*
            parentLinks.forEach(otherLink => {
                if (otherLink !== link) {
                    otherLink.parentElement.classList.remove('open');
                }
            });
            */
        });
    });

    // Handle Description Toggle via Arrow
    const descToggles = document.querySelectorAll('.desc-toggle');
    descToggles.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const item = this.closest('.submenu-item');
            item.classList.toggle('open');

            // Close other same-level descriptions if needed
            const siblings = item.parentElement.querySelectorAll('.submenu-item');
            siblings.forEach(sibling => {
                if (sibling !== item) {
                    sibling.classList.remove('open');
                }
            });
        });
    });

    // Ensure clicks on feature titles and descriptions still work for navigation
    // (They are already <a> tags or contain <a> tags, so default behavior should work)
});
