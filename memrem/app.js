import { FileExplorer } from "./scripts/file-explorer.js";
import { CardSystem } from "./scripts/card-system.js";
import { SettingsManager } from "./scripts/settings-manager.js";
import { UIController } from "./scripts/ui-controller.js";
import { ThemeController } from "./scripts/theme-controller.js";
import { LLMChat } from "./scripts/llm-chat.js";
import { setupImageZoom } from "./scripts/image-zoom.js";
import { i18n } from "./scripts/localization.js";

/**
 * Main application entry point
 * Sets up and initializes the file explorer and memorization cards
 */
document.addEventListener("DOMContentLoaded", async () => {
    // Store module references in window for debugging and cross-module access
    window.i18n = i18n;

    // Initialize theme controller first for consistent theming
    const themeController = new ThemeController();
    themeController.init();

    // Get DOM elements
    const elements = {
        // File explorer elements
        fileExplorerView: document.getElementById("file-explorer-view"),
        navigationBar: document.getElementById("navigation-bar") || null, // Will be created later
        statsPanel: document.getElementById("selection-stats"),
        panels: document.getElementById("panels"),
        leftPanel: document.getElementById("left-panel"),
        middlePanel: document.getElementById("middle-panel"),
        rightPanel: document.getElementById("right-panel"),
        itemsList: document.getElementById("items"),
        cardLearningButton: document.getElementById("continue-button"),
        chatLLMButton: document.getElementById("chat-llm-button"),

        // Card system elements
        memorizationCards: document.getElementById("memorization-cards"),
        showAnswerButton: document.getElementById("show-answer-button"),
        difficultyButtons: document.getElementById("difficulty-buttons"),
        cardFront: document.querySelector(".card-front"),
        cardBack: document.querySelector(".card-back"),

        // Add settings button reference back
        settingsButton: document.getElementById("settings-button"),

        // Chat elements (will be populated by the LLMChat class)
        chatScreen: document.getElementById("llm-chat-screen")
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
    const llmChat = new LLMChat(elements);

    // Create a reference to the explorer and uiController for global access
    window.fileExplorer = explorer;
    window.cardSystem = cardSystem;
    window.uiController = uiController;
    window.settingsManager = settingsManager;
    window.llmChat = llmChat;

    elements.explorer = explorer;

    // Register callback to process selected files
    explorer.onCardLearning(async (selectedFiles) => {
        if (selectedFiles.length === 0) return;

        console.log("Card learning:", selectedFiles.length, "files selected");

        // Load selected files into card system once all content is available
        await explorer.loadAllFiles(selectedFiles);
        cardSystem.setCards(selectedFiles);
        // Transition to memorization cards UI
        uiController.showMemorizationCards();
    });

    explorer.onChatLLM(async (selectedFiles) => {
        if (selectedFiles.length === 0) return;

        console.log("Chat with LLM:", selectedFiles.length, "files selected");

        // Load selected files into card system once all content is available
        await explorer.loadAllFiles(selectedFiles);

        // create context from all selected files
        const context = {
            title: selectedFiles.length === 1 ? selectedFiles[0].split('/').pop() : `${selectedFiles.length} selected files`,
            content: selectedFiles.map(file => {
                const content = explorer.state.fileContents[file];
                return `File: ${file}\n${content}`;
            }).join('\n\n'),
            source: selectedFiles.join(', ')
        };

        // Start the chat session
        llmChat.startChat(context);
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
            llmChat.init();

            // Show the file explorer UI initially
            uiController.showFileExplorer();

            // Setup image zoom
            setupImageZoom();

            // Initialize language system and update UI
            i18n.updateUI();

            console.log("Application initialized successfully");
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
