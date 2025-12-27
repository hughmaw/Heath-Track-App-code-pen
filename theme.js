// Theme Management
(function() {
    // Check for saved theme or system preference
    function getPreferredTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        // Check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme to document
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateToggleIcon(theme);
    }

    // Update the toggle button icon
    function updateToggleIcon(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
                // Refresh lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        }
    }

    // Toggle between light and dark
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    // Apply theme immediately to prevent flash
    applyTheme(getPreferredTheme());

    // Set up toggle button when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
            updateToggleIcon(getPreferredTheme());
        }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Expose toggle function globally
    window.toggleTheme = toggleTheme;
})();
