/**
 * UI Controller
 * 
 * Manages UI state transitions between different views
 */
export class UIController {
    constructor(elements, explorer) {
        this.elements = elements;
        this.explorer = explorer;
    }

    /**
     * Initialize UI controller
     */
    init() {
        this.setupBackButton();
        this.setupSettingsButton(); // Re-add settings button setup
        return this;
    }

    /**
     * Set up the back to file selection button
     */
    setupBackButton() {
        // Get reference to the existing button
        const backButton = document.getElementById("back-to-selection");

        if (!backButton) {
            console.error("Back button not found in the DOM");
            return;
        }
        // Add the event listener
        backButton.addEventListener("click", () => {
            console.log("Back button clicked");
            this.showFileExplorer();
        });
    }

    /**
     * Set up the settings button
     */
    setupSettingsButton() {
        const settingsButton = document.getElementById("settings-button");

        if (!settingsButton) {
            console.error("Settings button not found in the DOM");
            return;
        }

        settingsButton.addEventListener("click", () => {
            console.log("Settings button clicked");

            // Show the settings modal
            const settingsModal = document.getElementById("settings-modal");
            if (settingsModal) {
                settingsModal.classList.remove("hidden");
                // Focus the first interactive element for accessibility
                setTimeout(() => {
                    const firstInput = settingsModal.querySelector('input, button');
                    if (firstInput) firstInput.focus();
                }, 100);
            }
        });
    }

    /**
     * Update navigation bar reference
     */
    updateNavigationBarReference() {
        if (!this.elements.navigationBar) {
            this.elements.navigationBar = document.getElementById("navigation-bar");
        }
    }

    /**
     * Show file explorer UI, hide cards
     */
    showFileExplorer() {
        console.log("Showing file explorer");

        // Update navigation bar reference
        this.updateNavigationBarReference();

        // Show file explorer elements
        this.elements.panels.style.display = 'flex';
        this.elements.continueButton.style.display = 'block';
        if (this.elements.navigationBar) {
            this.elements.navigationBar.style.display = 'flex';
        }

        // Show the selection statistics panel if it exists
        if (this.explorer.elements.statsPanel) {
            this.explorer.elements.statsPanel.style.display = 'block';
        }

        // Hide card UI
        this.elements.memorizationCards.style.display = 'none';

        // Also update classes for any CSS transitions
        this.elements.panels.classList.remove("hidden");
        this.elements.continueButton.classList.remove("hidden");
        if (this.elements.navigationBar) {
            this.elements.navigationBar.classList.remove("hidden");
        }
        this.elements.memorizationCards.classList.add("hidden");
    }

    /**
     * Show memorization cards UI, hide file explorer
     */
    showMemorizationCards() {
        console.log("Showing memorization cards");

        // Update navigation bar reference
        this.updateNavigationBarReference();

        // Hide file explorer elements
        this.elements.panels.style.display = 'none';
        this.elements.continueButton.style.display = 'none';
        if (this.elements.navigationBar) {
            this.elements.navigationBar.style.display = 'none';
        }

        // Hide the selection statistics panel if it exists
        if (this.explorer.elements.statsPanel) {
            this.explorer.elements.statsPanel.style.display = 'none';
        }

        // Show card UI
        this.elements.memorizationCards.style.display = 'flex';

        // Also update classes for any CSS transitions
        this.elements.panels.classList.add("hidden");
        this.elements.continueButton.classList.add("hidden");
        if (this.elements.navigationBar) {
            this.elements.navigationBar.classList.add("hidden");
        }
        this.elements.memorizationCards.classList.remove("hidden");
    }
}
