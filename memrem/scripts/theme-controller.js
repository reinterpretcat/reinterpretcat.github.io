/**
 * Theme Controller
 * Manages theme switching between light and dark modes
 */
export class ThemeController {
    constructor() {
        this.themeSwitch = document.getElementById('theme-switch');
        this.storedTheme = localStorage.getItem('theme');

        // Initialize with stored preference or default to dark
        if (this.storedTheme === 'light') {
            document.documentElement.classList.add('light-theme');
            this.themeSwitch.checked = true;
        }
    }

    /**
     * Initialize theme controller
     */
    init() {
        this.setupEventListeners();
        return this;
    }

    /**
     * Set up event listeners for theme switching
     */
    setupEventListeners() {
        this.themeSwitch.addEventListener('change', () => {
            this.toggleTheme();
        });
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        if (this.themeSwitch.checked) {
            // Switch to light theme
            document.documentElement.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            // Switch to dark theme
            document.documentElement.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        }
    }
}
