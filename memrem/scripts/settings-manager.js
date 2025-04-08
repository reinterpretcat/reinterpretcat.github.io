/**
 * Settings Manager Module
 * 
 * Manages user preferences and settings UI for the card system
 */
export class SettingsManager {
    constructor(cardSystem) {
        this.cardSystem = cardSystem;
        this.elements = {
            settingsButton: document.getElementById("settings-button"),
            settingsModal: document.getElementById("settings-modal"),
            applyButton: document.getElementById("apply-settings"),
            closeButton: document.getElementById("close-settings"),
            shuffleCheckbox: document.getElementById("shuffle-cards"),
            reversedModeCheckbox: document.getElementById("reversed-mode"),
            srsModeCheckbox: document.getElementById("srs-mode"),
            maxCardsInput: document.getElementById("max-cards"),
            maxCardsLabel: document.getElementById("max-cards-label"),
            maxCardsContainer: document.getElementById("max-cards-container"),
            tagFilterContainer: document.getElementById('tag-filter-container'),
            tagFilterInput: document.getElementById('tag-filter'),
            tagSuggestions: document.getElementById('tag-suggestions'),
            addedTagsContainer: document.getElementById('added-tags-container'),
            filterRuleContainer: document.getElementById('tag-filter-container').querySelector('.filter-rule-container'),
        };

        this.listenersAdded = false;
        
        // Add close button to settings modal if it doesn't exist
        this.addCloseButton();
    }

    /**
     * Add a close button to the modal content
     */
    addCloseButton() {
        const modalContent = this.elements.settingsModal.querySelector('.modal-content');
        if (modalContent && !modalContent.querySelector('.settings-close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'settings-close-btn';
            closeBtn.setAttribute('aria-label', 'Close settings');
            closeBtn.innerHTML = '×';
            modalContent.appendChild(closeBtn);
            
            // Store reference to the button
            this.elements.modalCloseBtn = closeBtn;
        }
    }

    /**
     * Initialize the settings manager
     */
    init() {
        // Add reversed mode checkbox to elements
        this.elements.reversedModeCheckbox = document.getElementById("reversed-mode");

        this.setupEventListeners();
        return this; // For chaining
    }

    /**
     * Setup event listeners for the settings UI
     */
    setupEventListeners() {
        // Check if listeners are already added
        if (this.listenersAdded) {
            return;
        }

        // Open modal
        this.elements.settingsButton.addEventListener("click", () => {
            this.openSettingsModal();
        });

        // Close modal
        this.elements.closeButton.addEventListener("click", () => {
            this.closeSettingsModal();
        });
        
        // Close modal with the new close button
        if (this.elements.modalCloseBtn) {
            this.elements.modalCloseBtn.addEventListener("click", () => {
                this.closeSettingsModal();
            });
        }

        // Apply settings
        this.elements.applyButton.addEventListener("click", () => {
            this.applySettings();
        });

        // Close modal on Esc key
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !this.elements.settingsModal.classList.contains("hidden")) {
                this.closeSettingsModal();
            }
        });

        this.listenersAdded = true;
    }

    /**
     * Open the settings modal and populate current values
     */
    openSettingsModal() {
        this.elements.shuffleCheckbox.checked = this.cardSystem.preferences.shuffle;
        this.elements.reversedModeCheckbox.checked = this.cardSystem.preferences.reversedMode;
        this.elements.srsModeCheckbox.checked = this.cardSystem.preferences.srsMode || false; // Default to false
        this.elements.maxCardsInput.value = this.cardSystem.preferences.maxCards || 0; // Default to 0 (unlimited)

        // Initialize tag filter UI
        this.ensureTagFilterExists();

        // If there are existing tag filters, populate them
        if (this.cardSystem.preferences.tagFilter) {
            const tags = this.cardSystem.preferences.tagFilter.split(',').map(tag => tag.trim());
            this.updateAddedTags(tags);
        }

        // Show the modal
        this.elements.settingsModal.classList.remove("hidden");
    }

    /**
     * Ensure tag filter UI exists in the settings modal
     */
    ensureTagFilterExists() {
        // Add event listeners for autocomplete and tag addition
        this.elements.tagFilterInput.addEventListener('input', () => this.updateTagSuggestions());
        this.elements.tagFilterInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const firstSuggestion = this.elements.tagSuggestions.querySelector('li');
                if (firstSuggestion) {
                    this.addTagToFilter(firstSuggestion.textContent);
                } else if (this.elements.tagFilterInput.value.trim()) {
                    this.addTagToFilter(this.elements.tagFilterInput.value.trim());
                }
            }
        });
        this.elements.tagSuggestions.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                this.addTagToFilter(event.target.textContent);
            }
        });
        this.elements.addedTagsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-tag')) {
                this.removeTagFromFilter(event.target.dataset.tag);
            }
        });

        // Update the added tags display
        this.updateAddedTags();
    }

    /**
     * Update tag suggestions based on input
     */
    updateTagSuggestions() {
        const input = this.elements.tagFilterInput.value.toLowerCase();
        const suggestions = Array.from(this.cardSystem.availableTags)
            .filter(tag => tag.toLowerCase().includes(input) && !this.getCurrentTags().includes(tag))
            .slice(0, 10); // Limit to 10 suggestions

        const dropdown = this.elements.tagSuggestions;
        dropdown.innerHTML = suggestions.map(tag => `<li>${tag}</li>`).join('');
        dropdown.classList.toggle('hidden', suggestions.length === 0);
    }

    /**
     * Add a tag to the filter input
     */
    addTagToFilter(tag) {
        const currentTags = this.getCurrentTags();
        if (!currentTags.includes(tag)) {
            currentTags.push(tag);
            this.updateAddedTags(currentTags);
        }
        this.elements.tagFilterInput.value = '';
        this.elements.tagSuggestions.classList.add('hidden');
    }

    /**
     * Remove a tag from the filter input
     */
    removeTagFromFilter(tag) {
        const currentTags = this.getCurrentTags().filter(t => t !== tag);
        this.updateAddedTags(currentTags);
    }

    /**
     * Get the current list of tags
     */
    getCurrentTags() {
        return Array.from(this.elements.addedTagsContainer.querySelectorAll('.tag'))
            .map(tagElement => tagElement.textContent.replace('×', '').trim()); // Remove the cross (×) from the tag text
    }

    /**
     * Update the added tags display
     */
    updateAddedTags(tags = this.getCurrentTags()) {
        this.elements.addedTagsContainer.innerHTML = tags.map(tag => `
            <span class="tag">
                ${tag}
                <button class="remove-tag" data-tag="${tag}">×</button>
            </span>
        `).join('');
    }

    /**
     * Close the settings modal without applying changes
     */
    closeSettingsModal() {
        this.elements.settingsModal.classList.add("hidden");
    }

    /**
     * Apply the selected settings
     */
    applySettings() {
        // Update card system preferences
        this.cardSystem.preferences.shuffle = this.elements.shuffleCheckbox.checked;
        this.cardSystem.preferences.reversedMode = this.elements.reversedModeCheckbox.checked;
        this.cardSystem.preferences.srsMode = this.elements.srsModeCheckbox.checked;

        // Get max cards value
        const maxCardsValue = parseInt(this.elements.maxCardsInput.value);
        this.cardSystem.preferences.maxCards = (isNaN(maxCardsValue) || maxCardsValue < 0) ? 0 : maxCardsValue;

        // Update the card system state
        this.cardSystem.isReversedMode = this.cardSystem.preferences.reversedMode;
        this.cardSystem.isSrsMode = this.cardSystem.preferences.srsMode;

        // Get tag filter value from the added tags container
        const currentTags = this.getCurrentTags();
        this.cardSystem.preferences.tagFilter = currentTags.length > 0 ? currentTags.join(', ') : null;

        // Get the selected filter rule (AND/OR)
        const selectedRule = this.elements.filterRuleContainer.querySelector('input[name="filter-rule"]:checked').value;
        this.cardSystem.preferences.filterRule = selectedRule;

        // Debug output for selected tags and rule
        console.debug("Selected tags for filtering:", this.cardSystem.preferences.tagFilter);
        console.debug("Selected filter rule:", selectedRule);
        console.debug("SRS mode enabled:", this.cardSystem.preferences.srsMode);
        console.debug("Max cards:", this.cardSystem.preferences.maxCards);

        // Save preferences and reapply filters
        localStorage.setItem("cardPreferences", JSON.stringify(this.cardSystem.preferences));
        this.cardSystem.applyFilters();
        this.cardSystem.showCurrentCard();

        // Close the modal
        this.closeSettingsModal();
    }
}
