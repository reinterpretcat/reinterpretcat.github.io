import { FileExplorer } from "./scripts/file-explorer.js";
import { CardSystem } from "./scripts/card-system.js";
import { SettingsManager } from "./scripts/settings-manager.js";
import { UIController } from "./scripts/ui-controller.js";
import { ThemeController } from "./scripts/theme-controller.js";

/**
 * Main application entry point
 * Sets up and initializes the file explorer and memorization cards
 */
document.addEventListener("DOMContentLoaded", () => {
    // Initialize theme controller first for consistent theming
    const themeController = new ThemeController();
    themeController.init();
    
    // Get DOM elements
    const elements = {
        // File explorer elements
        navigationBar: document.getElementById("navigation-bar") || null, // Will be created later
        panels: document.getElementById("panels"),
        leftPanel: document.getElementById("left-panel"),
        middlePanel: document.getElementById("middle-panel"),
        rightPanel: document.getElementById("right-panel"),
        itemsList: document.getElementById("items"),
        continueButton: document.getElementById("continue-button"),

        // Card system elements
        memorizationCards: document.getElementById("memorization-cards"),
        showAnswerButton: document.getElementById("show-answer-button"),
        difficultyButtons: document.getElementById("difficulty-buttons"),
        cardFront: document.querySelector(".card-front"),
        cardBack: document.querySelector(".card-back"),
        
        // Add settings button reference back
        settingsButton: document.getElementById("settings-button"),
    };

    // Ensure initial UI state
    elements.memorizationCards.style.display = 'none';
    elements.memorizationCards.classList.add('hidden');
    elements.panels.style.display = 'flex'; // Make sure panels are visible

    // Create and initialize component systems
    const cardSystem = new CardSystem(elements);
    const explorer = new FileExplorer(elements);
    const uiController = new UIController(elements, explorer);
    const settingsManager = new SettingsManager(cardSystem);

    // Create a reference to the explorer for global access
    window.fileExplorer = explorer;
    elements.explorer = explorer;

    // Register callback to process selected files
    explorer.onSelection(selectedFiles => {
        console.log("Selection complete:", selectedFiles.length, "files selected");

        // Ensure we have proper file access
        if (!explorer.state.fileContents) {
            explorer.state.fileContents = {};
        }

        // Ensure all selected files have their content loaded
        const contentPromises = selectedFiles.map(file => {
            if (!explorer.state.fileContents[file]) {
                return explorer.loadFileContent(file)
                    .then(content => {
                        if (content) {
                            explorer.state.fileContents[file] = content;
                        }
                    })
                    .catch(error => {
                        console.error(`Failed to load content for ${file}:`, error);
                    });
            }
            return Promise.resolve();
        });

        // Load selected files into card system once all content is available
        Promise.all(contentPromises).then(() => {
            cardSystem.setCards(selectedFiles);
            // Transition to memorization cards UI
            uiController.showMemorizationCards();
        });
    });

    // Initialize the application components
    console.log("Initializing application...");
    explorer.init()
        .then(() => {
            console.log("Explorer initialized successfully");
            
            // Initialize all other components
            cardSystem.init();
            uiController.init();
            settingsManager.init();
            
            // Show the file explorer UI initially
            uiController.showFileExplorer();
        })
        .catch(error => {
            console.error("Error initializing application:", error);
            // Show an error message to the user if needed
            elements.middlePanel.innerHTML = `
                <div class="empty-message">
                    <p>Error loading application: ${error.message}</p>
                    <p>Please check the console for more details.</p>
                </div>
            `;
        });
});
