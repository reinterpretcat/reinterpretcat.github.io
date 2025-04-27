import { setupImageZoom } from "./image-zoom.js"; // Import image zoom

/**
 * Card System Module
 * 
 * A self-contained memorization card component that provides spaced repetition features.
 */
export class CardSystem {
    constructor(elements) {
        // Store DOM elements
        this.elements = elements;

        // Track cards and current position
        this.cards = [];
        this.currentCardIndex = 0;
        this.filteredCards = [];
        this.availableTags = new Set(); // Store unique tags

        // Session statistics
        this.sessionStats = {
            started: null,
            cardsReviewed: 0,
            results: {
                easy: 0,
                medium: 0,
                hard: 0
            }
        };

        // User preferences (with defaults)
        this.preferences = this.loadPreferences();

        // Bind event handlers to preserve 'this' context
        this.handleShowAnswer = this.handleShowAnswer.bind(this);
        this.handleDifficultySelection = this.handleDifficultySelection.bind(this);
        this.handleNextCard = this.handleNextCard.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.isReversedMode = this.preferences.reversedMode || false; // Initialize from preferences
        this.isSrsMode = this.preferences.srsMode || false; // Initialize SRS mode from preferences
    }

    /**
     * Initialize the card system
     */
    init() {
        this.setupEventListeners();
        this.setupProgressBar();
        this.sessionStats.started = new Date();
        return this; // For chaining
    }

    /**
     * Set up card content from selected files
     */
    setCards(selectedFiles) {
        console.log("Loading cards from:", selectedFiles);

        if (!selectedFiles || selectedFiles.length === 0) {
            this.setDefaultCards();
            return this;
        }

        // Create cards from selected files
        this.cards = this.createCardsFromFiles(selectedFiles);

        // Load any saved progress for these cards
        this.loadSavedProgress();

        // Apply any filters based on user preferences
        this.applyFilters();

        // Start from the beginning
        this.currentCardIndex = 0;
        this.sessionStats.cardsReviewed = 0;
        this.sessionStats.results = { easy: 0, medium: 0, hard: 0 };
        this.sessionStats.started = new Date(); // Reset time counter when new cards are loaded

        // Show the first card
        this.showCurrentCard();
        this.updateProgressBar();
        return this;
    }

    /**
     * Create cards from file paths
     */
    createCardsFromFiles(files) {
        const cards = [];

        files.forEach(file => {
            // Get file content
            const fileContent = this.getFileContent(file);

            if (fileContent) {
                // Parse all sections in the file content
                const cardSections = this.parseCardSections(fileContent);

                if (cardSections.length > 0) {
                    // Add each section as a separate card
                    cardSections.forEach(section => {
                        cards.push({
                            ...section,
                            id: `${file}/${section.title}`,
                            source: file
                        });
                    });

                    console.log(`Created ${cardSections.length} cards from file: ${file}`);
                } else {
                    console.warn(`No card sections found in file: ${file}`);
                }
            } else {
                console.warn(`Could not load content for file: ${file}`);
            }
        });

        return cards;
    }

    /**
     * Get file content from explorer if available
     */
    getFileContent(filePath) {
        // Try to access file content from the file explorer
        if (window.fileExplorer && window.fileExplorer.state.fileContents) {
            return window.fileExplorer.state.fileContents[filePath];
        }

        // Alternative: check if our elements object has access to explorer
        if (this.elements.explorer && this.elements.explorer.state.fileContents) {
            return this.elements.explorer.state.fileContents[filePath];
        }

        return null;
    }

    /**
     * Parse all card sections from a file content
     */
    parseCardSections(content) {
        const cards = [];
        const lines = content.split('\n');

        // Find the file category from the first heading
        let category = 'Vocabulary';
        const pathMatch = lines[0].match(/^# (.+)/);
        if (pathMatch && pathMatch[1]) {
            category = pathMatch[1];
        }

        // Find all section headers (## headings)
        let sectionStart = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Found a section header
            if (line.startsWith('## ')) {
                // If we were already processing a section, finish it
                if (sectionStart !== -1) {
                    const sectionLines = lines.slice(sectionStart, i);
                    const card = this.processSectionContent(sectionLines, category);
                    if (card) cards.push(card);
                }

                // Start a new section
                sectionStart = i;
            }

            // If line starts with >, it's a tag line
            if (line.startsWith('>')) {
                const tagText = line.substring(1).trim();
                const tags = tagText.split(',').map(tag => tag.trim());
                tags.forEach(tag => this.availableTags.add(tag)); // Collect unique tags
                continue;
            }
        }

        // Process the last section if there is one
        if (sectionStart !== -1) {
            const sectionLines = lines.slice(sectionStart);
            const card = this.processSectionContent(sectionLines, category);
            if (card) cards.push(card);
        }

        return cards;
    }

    /**
     * Process a single section to extract card content and tags
     */
    processSectionContent(sectionLines) {
        if (sectionLines.length === 0) return null;

        // Extract section title from the first line (## Title)
        const titleMatch = sectionLines[0].match(/^## (.+)/);
        if (!titleMatch) return null;

        const title = titleMatch[1].trim();
        const contentLines = sectionLines.slice(1);

        // Process content lines to extract front and back parts
        const frontParts = [];
        const backParts = [];
        let currentPart = null;
        let isInFront = false;
        let isInBack = false;
        let tags = [];

        for (const line of contentLines) {
            const trimmedLine = line.trim();

            // If line starts with >, it's a tag line
            if (trimmedLine.startsWith('>')) {
                // Extract tags (remove '>' prefix and split by commas)
                const tagText = trimmedLine.substring(1).trim();
                tags = tagText.split(',').map(tag => tag.trim()).filter(tag => tag);
                continue;
            }

            // New front item (starts with dash)
            if (trimmedLine.startsWith('- ')) {
                // Save previous part if exists
                if (currentPart) {
                    if (isInFront) frontParts.push(currentPart);
                    else if (isInBack) backParts.push(currentPart);
                }

                // Start new front part
                currentPart = trimmedLine.substring(2);
                isInFront = true;
                isInBack = false;
            }
            // New back item (starts with asterisk)
            else if (trimmedLine.startsWith('* ')) {
                // Save previous part if exists
                if (currentPart) {
                    if (isInFront) frontParts.push(currentPart);
                    else if (isInBack) backParts.push(currentPart);
                }

                // Start new back part
                currentPart = trimmedLine.substring(2);
                isInFront = false;
                isInBack = true;
            }
            // Continuation line (add to current part)
            else if (trimmedLine && (isInFront || isInBack)) {
                currentPart += '\n' + trimmedLine;
            }
        }

        // Save final part if exists
        if (currentPart) {
            if (isInFront) frontParts.push(currentPart);
            else if (isInBack) backParts.push(currentPart);
        }

        // Ensure we have at least some content
        if (frontParts.length === 0 && backParts.length === 0) {
            console.warn(`No content found for section "${title}"`);
            return null;
        }

        return {
            title: title,
            question: frontParts.join('\n\n'),
            answer: backParts.join('\n\n'),
            lastSeen: null,
            attempts: 0,
            tags: tags  // Add the extracted tags
        };
    }

    /**
     * Set default cards when no files are selected
     */
    setDefaultCards() {
        this.cards = [
            {
                id: 'default1',
                question: 'What is the German word for "House"?',
                answer: 'Haus',
                lastSeen: null,
                attempts: 0
            },
            {
                id: 'default2',
                question: 'What is the German word for "Tree"?',
                answer: 'Baum',
                lastSeen: null,
                attempts: 0
            },
            {
                id: 'default3',
                question: 'What case is used for the direct object in German?',
                answer: 'The Accusative case (Akkusativ)',
                lastSeen: null,
                attempts: 0
            }
        ];

        this.filteredCards = [...this.cards];
        this.currentCardIndex = 0;
        this.showCurrentCard();
        this.updateProgressBar();
    }

    /**
     * Apply any filters based on user preferences
     */
    applyFilters() {
        // Start with all cards
        this.filteredCards = [...this.cards];

        // If SRS mode is enabled, filter by review date
        if (this.isSrsMode) {
            const now = new Date();
            this.filteredCards = this.filteredCards.filter(card => {
                // Include cards that don't have a nextReview date yet
                if (!card.nextReview) return true;
                // Include cards whose review date has arrived
                return new Date(card.nextReview) <= now;
            });
        }

        // Filter by tags
        if (this.preferences.tagFilter) {
            const filterTags = this.preferences.tagFilter.split(',').map(tag => tag.trim().toLowerCase());
            const filterRule = this.preferences.filterRule || 'any'; // Default to 'any'

            if (filterTags.length > 0) {
                this.filteredCards = this.filteredCards.filter(card => {
                    // Cards with no tags don't match
                    if (!card.tags || card.tags.length === 0) return false;

                    const cardTags = card.tags.map(tag => tag.toLowerCase());

                    if (filterRule === 'all') {
                        // AND condition: all filter tags must be present in the card's tags
                        return filterTags.every(tag => cardTags.includes(tag));
                    } else {
                        // OR condition: at least one filter tag must be present in the card's tags
                        return filterTags.some(tag => cardTags.includes(tag));
                    }
                });
            }
        }

        // Shuffle if needed
        if (this.preferences.shuffle) {
            this.shuffleCards();
        }

        // Apply max cards limit after shuffling (if max cards is set)
        if (this.preferences.maxCards > 0) {
            this.filteredCards = this.filteredCards.slice(0, this.preferences.maxCards);
        }

        // Reset to first card after filtering
        this.currentCardIndex = 0;

        // Update UI to show how many cards are available for review
        this.updateDueCardCount();
    }

    /**
     * Update the UI to show how many cards are due for review
     */
    updateDueCardCount() {
        // Update the progress text to show the number of due cards
        if (this.elements.progressText && this.isSrsMode) {
            const dueCount = this.filteredCards.length;
            const totalCount = this.cards.length;
            this.elements.progressText.textContent = `${dueCount} of ${totalCount} cards due for review`;
        }
    }

    /**
     * Shuffle the filtered cards
     */
    shuffleCards() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.filteredCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.filteredCards[i], this.filteredCards[j]] = [this.filteredCards[j], this.filteredCards[i]];
        }
    }

    /**
     * Setup event listeners with a simple flag approach
     */
    setupEventListeners() {
        // Check if listeners are already added
        if (this.listenersAdded) {
            return;
        }

        // Add button event listeners
        this.elements.showAnswerButton.addEventListener("click", this.handleShowAnswer);
        this.elements.difficultyButtons.addEventListener("click", this.handleDifficultySelection);

        // Add keyboard navigation
        document.addEventListener("keydown", this.handleKeyDown);

        this.listenersAdded = true;
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyDown(event) {
        // Only process keys when cards are visible
        if (this.elements.memorizationCards.classList.contains('hidden')) {
            return;
        }

        switch (event.key) {
            case ' ':
                // Space bar to show answer
                if (!this.elements.showAnswerButton.classList.contains('hidden')) {
                    this.handleShowAnswer();
                    event.preventDefault();
                }
                break;
            case '1':
            case 'e':
                // Easy
                if (!this.elements.difficultyButtons.classList.contains('hidden')) {
                    this.processCardDifficulty('easy');
                    event.preventDefault();
                }
                break;
            case '2':
            case 'm':
                // Medium
                if (!this.elements.difficultyButtons.classList.contains('hidden')) {
                    this.processCardDifficulty('medium');
                    event.preventDefault();
                }
                break;
            case '3':
            case 'h':
                // Hard
                if (!this.elements.difficultyButtons.classList.contains('hidden')) {
                    this.processCardDifficulty('hard');
                    event.preventDefault();
                }
                break;
        }
    }

    /**
     * Set up the progress bar
     */
    setupProgressBar() {
        // Simply reference the existing progress bar elements in HTML
        this.elements.progressBar = this.elements.memorizationCards.querySelector('.progress-bar');
        this.elements.progressText = this.elements.memorizationCards.querySelector('.progress-text');
        this.elements.sourceInfo = this.elements.memorizationCards.querySelector('.source-info');
        this.elements.progressContainer = this.elements.memorizationCards.querySelector('.progress-container');
    }

    /**
     * Update the progress bar
     */
    updateProgressBar() {
        if (!this.elements.progressBar) return;

        const totalCards = this.filteredCards.length + this.sessionStats.cardsReviewed;
        const completedCards = this.sessionStats.cardsReviewed;

        // Calculate percentage of completed cards
        const percentage = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;

        this.elements.progressBar.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `${completedCards}/${totalCards} (${this.cards.length}) cards`;
    }

    /**
     * Display the current card
     */
    showCurrentCard() {
        // No cards available
        if (this.filteredCards.length === 0) {
            this.showEmptyState();
            return;
        }

        // Get the current card
        const card = this.filteredCards[this.currentCardIndex];

        console.log("Showing card:", card.title);
        console.log("Front content:", card.question);
        console.log("Back content:", card.answer);

        // Clear previous content first
        this.elements.cardFront.innerHTML = '';
        this.elements.cardBack.innerHTML = '';

        // Update card content based on reversed mode
        if (this.isReversedMode) {
            this.elements.cardFront.innerHTML = this.formatCardContent(card.answer);
            this.elements.cardBack.innerHTML = this.formatCardContent(card.question);
        } else {
            this.elements.cardFront.innerHTML = this.formatCardContent(card.question);
            this.elements.cardBack.innerHTML = this.formatCardContent(card.answer);
        }

        // Add tags to the back of the card if they exist
        if (card.tags && card.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'card-tags';

            card.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'card-tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });

            this.elements.cardBack.appendChild(tagsContainer);
        }

        // Add source file information to the back of the card
        if (card.source) {
            this.elements.sourceInfo.textContent = `Source: ${card.source}`;
        }

        // Reset card state (show front, hide back)
        this.elements.cardFront.classList.remove("hidden");
        this.elements.cardBack.classList.add("hidden");
        this.elements.difficultyButtons.classList.add("hidden");
        this.elements.showAnswerButton.classList.remove("hidden");

        // Update progress bar
        this.updateProgressBar();

        // Add animation class to trigger fade-in
        this.elements.cardFront.classList.add('card-fade-in');
        setTimeout(() => {
            this.elements.cardFront.classList.remove('card-fade-in');
        }, 300);
    }

    /**
     * Format card content with proper styling for images and text
     */
    formatCardContent(content) {
        if (!content) return '<p class="card-text">No content</p>';

        // Split content into individual content items
        const contentItems = content.split('\n\n');
        let formattedHtml = '';

        // Process each content item
        contentItems.forEach(item => {
            // Check if item contains images
            if (item.includes('![') && item.includes('](')) {
                formattedHtml += this.formatContentWithImages(item);
            } else if (item.trim()) {
                // Regular text - line by line
                const lines = item.split('\n');
                formattedHtml += '<div class="card-item">';
                lines.forEach(line => {
                    if (line.trim()) {
                        formattedHtml += `<p class="card-text">${line}</p>`;
                    }
                });
                formattedHtml += '</div>';
            }
        });

        // Initialize image zoom functionality after rendering content
        setTimeout(() => {
            setupImageZoom();
        }, 10);

        return formattedHtml || '<p class="card-text">No content</p>';
    }

    /**
     * Format content that contains image markdown
     */
    formatContentWithImages(content) {
        if (!content.trim()) return '';

        let formattedHtml = '<div class="card-item">';
        const lines = content.split('\n');

        // Process each line to separate text and images
        lines.forEach(line => {
            // Skip empty lines
            if (!line.trim()) return;

            // If line contains image markdown
            if (line.includes('![') && line.includes('](')) {
                // Replace image markdown with HTML
                let processedLine = line;
                const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
                let match;

                while ((match = imageRegex.exec(line)) !== null) {
                    const fullMatch = match[0];
                    const altText = match[1];
                    const imageUrl = match[2];

                    // Create image HTML with zoomable class
                    const imageHtml = `<div class="card-image-container">
                        <img src="${imageUrl}" alt="${altText}" class="card-image zoomable" loading="lazy" title="Click to enlarge" />
                    </div>`;

                    // Replace the markdown with HTML
                    processedLine = processedLine.replace(fullMatch, imageHtml);
                }

                // Add the processed line with images
                formattedHtml += processedLine;
            } else {
                // Regular text line
                formattedHtml += `<p class="card-text">${line}</p>`;
            }
        });

        formattedHtml += '</div>';
        return formattedHtml;
    }


    /**
     * Show a category badge on the card
     */
    showCategoryBadge(category) {
        if (!category) {
            category = 'General';
        }

        // Create or update category badge
        let badge = this.elements.memorizationCards.querySelector('.category-badge');

        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'category-badge';
            this.elements.memorizationCards.querySelector('.card').appendChild(badge);
        }

        // Set category text content
        badge.textContent = category;

        // Reset all classes first
        badge.className = 'category-badge';

        // Add a safe CSS class by removing spaces and special characters
        const safeCategory = category.toLowerCase()
            .replace(/\s+/g, '-')        // Replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, ''); // Remove any other non-alphanumeric characters

        // Add the sanitized category class
        if (safeCategory) {
            badge.classList.add(`category-${safeCategory}`);
        }
    }

    /**
     * Display a message when there are no cards
     */
    showEmptyState() {
        // Check if there are cards filtered by SRS
        let srsFilteredMessage = '';
        if (this.isSrsMode && this.cards.length > 0 && this.filteredCards.length === 0) {
            srsFilteredMessage = `
                <p class="small">All cards are scheduled for future review.</p>
                <button id="reset-all-srs" class="action-button secondary">Reset All SRS Data</button>
            `;

            // Add event listener for the reset button
            document.getElementById("reset-all-srs").addEventListener("click", () => {
                this.resetAllSrsData();
            });
        }

        this.elements.cardFront.innerHTML = `
            <div class="empty-state">
                <p>No cards available</p>
                ${srsFilteredMessage}
                <p class="small">Please go back and select content files</p>
            </div>
        `;
        this.elements.cardBack.innerHTML = '';
        this.elements.showAnswerButton.classList.add("hidden");

        // Reset progress
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = '0%';
            this.elements.progressText.textContent = '0/0 cards';
        }
    }

    /**
     * Reset SRS data for all cards
     */
    resetAllSrsData() {
        // Reset all cards to unlearned state
        this.cards.forEach(card => {
            card.interval = 0;
            card.nextReview = null;
            card.difficulty = null;
            card.lastSeen = null;
            card.attempts = 0;
        });

        // Save progress to localStorage
        this.saveProgress();

        // Reapply filters (which will now include all cards)
        this.applyFilters();

        // Show the first card or empty state
        if (this.filteredCards.length > 0) {
            this.currentCardIndex = 0;
            this.showCurrentCard();
        } else {
            this.showEmptyState();
        }
    }

    /**
     * Show the memorization cards UI
     */
    show() {
        console.log("CardSystem: showing cards UI");
        // Use both direct style manipulation and class toggling for reliability
        this.elements.memorizationCards.style.display = 'flex';
        this.elements.memorizationCards.classList.remove("hidden");
        this.showCurrentCard();
    }

    /**
     * Hide the memorization cards UI
     */
    hide() {
        console.log("CardSystem: hiding cards UI");
        this.elements.memorizationCards.style.display = 'none';
        this.elements.memorizationCards.classList.add("hidden");

        // Pause the session - we could save state here if needed
    }

    /**
     * Handle showing the answer
     */
    handleShowAnswer() {
        console.log("Showing answer");

        // Hide the front and show the back
        this.elements.cardFront.classList.add('hidden');
        this.elements.cardBack.classList.remove('hidden');

        // Ensure the back content is displayed
        this.elements.cardBack.style.display = 'block';

        // Display SRS information if SRS mode is enabled
        this.displaySrsInfo();

        // Update button visibility
        this.elements.showAnswerButton.classList.add("hidden");
        this.elements.difficultyButtons.classList.remove("hidden");

        // Log the state for debugging
        console.log("Front hidden:", this.elements.cardFront.classList.contains('hidden'));
        console.log("Back visible:", !this.elements.cardBack.classList.contains('hidden'));
    }

    /**
     * Handle difficulty selection
     */
    handleDifficultySelection(event) {
        if (!event.target.classList.contains("difficulty-button")) return;

        const difficulty = event.target.dataset.difficulty;
        this.processCardDifficulty(difficulty);
    }

    /**
     * Calculate the next review date based on SRS algorithm
     * @param {Object} card - The card object
     * @param {String} difficulty - The difficulty rating (easy, medium, hard)
     * @returns {Date} - The next review date
     */
    calculateNextReviewDate(card, difficulty) {
        // Initialize interval if it doesn't exist
        if (!card.interval) {
            card.interval = 0;
        }

        // Factor based on difficulty
        let factor;
        switch (difficulty) {
            case 'easy':
                factor = 2.5;
                break;
            case 'medium':
                factor = 1.5;
                break;
            case 'hard':
                factor = 1.0;
                break;
            default:
                factor = 1.0;
        }

        // Calculate new interval
        if (card.interval === 0) {
            // First time seeing the card
            if (difficulty === 'easy') card.interval = 3;
            else if (difficulty === 'medium') card.interval = 1;
            else card.interval = 0.5;
        } else {
            // Adjust interval based on difficulty
            card.interval = Math.round(card.interval * factor);
        }

        // Ensure minimum and maximum interval
        card.interval = Math.max(0.5, Math.min(card.interval, 365)); // Cap interval at 365 days

        // Calculate next review date
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + card.interval);

        return nextReview;
    }

    /**
     * Process card difficulty selection
     */
    processCardDifficulty(difficulty) {
        if (this.filteredCards.length > 0) {
            const currentCard = this.filteredCards[this.currentCardIndex];
            currentCard.difficulty = difficulty;
            currentCard.lastSeen = new Date();
            currentCard.attempts++;

            // Only calculate next review date if SRS mode is enabled
            if (this.isSrsMode) {
                currentCard.nextReview = this.calculateNextReviewDate(currentCard, difficulty);
            }

            // Track results
            this.sessionStats.results[difficulty]++;

            // Handle difficulty-specific behavior
            if (difficulty === 'easy') {
                // Remove card from session and mark as reviewed
                this.filteredCards.splice(this.currentCardIndex, 1);
                this.sessionStats.cardsReviewed++;
                // Decrement index to account for the removed card
                this.currentCardIndex--;
            } else if (difficulty === 'medium') {
                // Move card to the end of the queue
                const card = this.filteredCards.splice(this.currentCardIndex, 1)[0];
                this.filteredCards.push(card);
                // Decrement index to account for the removed card
                this.currentCardIndex--;
            } else if (difficulty === 'hard') {
                // Move card to appear after 2-3 other cards
                const card = this.filteredCards.splice(this.currentCardIndex, 1)[0];
                if (this.filteredCards.length <= 1) {
                    // If only 0-1 other cards, put at the end
                    this.filteredCards.push(card);
                } else {
                    // Insert after 2-3 cards (bounded by available cards)
                    const spacing = Math.min(2 + Math.floor(Math.random() * 2), this.filteredCards.length);
                    // Insert at current position + spacing (or at the end if that would go beyond the array)
                    const insertIndex = Math.min(this.currentCardIndex + spacing, this.filteredCards.length);
                    this.filteredCards.splice(insertIndex, 0, card);
                }
                // Decrement index to account for the removed card
                this.currentCardIndex--;
            }

            // Check if all cards are marked as easy
            if (this.filteredCards.length === 0) {
                this.showCompletionMessage();
                return;
            }

            // Save progress to localStorage
            this.saveProgress();
        }

        // Update UI
        this.elements.difficultyButtons.classList.add("hidden");

        // Automatically move to the next card
        this.handleNextCard();
    }

    /**
     * Handle next card logic
     */
    handleNextCard() {
        if (this.filteredCards.length === 0) return;

        // Move to the next card with index bounds checking
        this.currentCardIndex = (this.currentCardIndex + 1) % this.filteredCards.length;

        // Show the next card
        this.showCurrentCard();
    }

    /**
     * Show completion message when all cards are easy
     */
    showCompletionMessage() {
        // Ensure the front side is shown
        this.elements.cardFront.classList.remove("hidden");
        this.elements.cardBack.classList.add("hidden");

        // Calculate session statistics
        const sessionDuration = Math.floor((new Date() - this.sessionStats.started) / 1000);
        const minutes = Math.floor(sessionDuration / 60);
        const seconds = sessionDuration % 60;
        const timeSpent = `${minutes}m ${seconds}s`;

        this.elements.cardFront.innerHTML = `
            <div class="completion-message">
                <div class="completion-banner">
                    <h2>🎉 Congratulations! 🎉</h2>
                    <p>You have mastered all the cards in this session.</p>
                </div>

                <div class="session-stats">
                    <div class="stats-item">
                        <span>Reviewed cards:</span>
                        <span>${this.sessionStats.cardsReviewed}</span>
                    </div>
                    <div class="stats-item">
                        <span>Time spent:</span>
                        <span>${timeSpent}</span>
                    </div>
                    <div class="stats-item">
                        <span>Marked as easy:</span>
                        <span>${this.sessionStats.results.easy}</span>
                    </div>
                    <div class="stats-item">
                        <span>Marked as medium:</span>
                        <span>${this.sessionStats.results.medium}</span>
                    </div>
                    <div class="stats-item">
                        <span>Marked as hard:</span>
                        <span>${this.sessionStats.results.hard}</span>
                    </div>
                </div>

                <div class="completion-actions">
                    <button id="start-new-session" class="action-button">Start New Session</button>
                </div>
            </div>
        `;
        this.elements.cardBack.innerHTML = '';
        this.elements.showAnswerButton.classList.add("hidden");
        this.elements.difficultyButtons.classList.add("hidden");

        // Reset progress
        this.elements.progressBar.style.width = '100%';
        this.elements.progressText.textContent = 'Session Complete';

        // Add event listener for buttons
        const newSessionBtn = document.getElementById("start-new-session");
        if (newSessionBtn) {
            newSessionBtn.addEventListener("click", () => {
                this.resetSession();
            });
        }
    }

    /**
     * Reset the session to allow starting over
     */
    resetSession() {
        // Instead of directly copying all cards, apply the filters
        this.applyFilters();

        // Reset session statistics
        this.currentCardIndex = 0;
        this.sessionStats.cardsReviewed = 0;
        this.sessionStats.results = { easy: 0, medium: 0, hard: 0 };
        this.sessionStats.started = new Date(); // Reset the session start time

        // Show the first card and update progress
        this.showCurrentCard();
        this.updateProgressBar();
    }

    /**
     * Load saved progress from localStorage
     */
    loadSavedProgress() {
        const savedProgress = localStorage.getItem('cardProgress');

        if (savedProgress) {
            try {
                const progressData = JSON.parse(savedProgress);

                // Update card data with saved progress
                if (progressData.cards && progressData.cards.length > 0) {
                    progressData.cards.forEach(savedCard => {
                        const card = this.cards.find(c => c.id === savedCard.id);
                        if (card) {
                            card.lastSeen = savedCard.lastSeen ? new Date(savedCard.lastSeen) : null;
                            card.attempts = savedCard.attempts || 0;
                            card.difficulty = savedCard.difficulty || 'medium';
                            card.interval = savedCard.interval || 0;
                            card.nextReview = savedCard.nextReview ? new Date(savedCard.nextReview) : null;
                        }
                    });

                    console.log("Loaded progress for", progressData.cards.length, "cards");
                }
            } catch (error) {
                console.error("Error loading saved progress:", error);
            }
        }
    }

    /**
     * Save user progress to localStorage
     */
    saveProgress() {
        const progressData = {
            cards: this.cards.map(card => ({
                id: card.id,
                lastSeen: card.lastSeen,
                attempts: card.attempts,
                difficulty: card.difficulty,
                interval: card.interval,
                nextReview: card.nextReview
            })),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('cardProgress', JSON.stringify(progressData));
    }

    /**
     * Display the SRS information or next review date for the current card
     */
    displaySrsInfo() {
        const card = this.filteredCards[this.currentCardIndex];
        if (!card) return;

        // Create or update SRS info element
        let srsInfoElement = this.elements.cardBack.querySelector(".srs-details");
        if (!srsInfoElement) {
            srsInfoElement = document.createElement("div");
            srsInfoElement.className = "srs-details";
            this.elements.cardBack.appendChild(srsInfoElement);
        }

        // Format the next review date if it exists
        let reviewDateText = "Not scheduled yet";
        if (card.nextReview) {
            const reviewDate = new Date(card.nextReview);
            reviewDateText = reviewDate.toLocaleDateString();
        }

        // Show the interval and next review date, even if SRS is disabled
        srsInfoElement.innerHTML = `
            Interval: ${card.interval || 0} days
            <span class="review-date">Next review: ${reviewDateText}
            <button class="reset-srs-button" title="Reset to Unlearned">↺</button>
            </span>
        `;

        // Add event listener for the reset button if SRS is enabled
        srsInfoElement.querySelector(".reset-srs-button").addEventListener("click", () => {
            this.resetCardToUnlearned(card);
        });
    }

    /**
     * Reset a card's SRS state to "unlearned"
     */
    resetCardToUnlearned(card) {
        card.interval = 0;
        card.nextReview = null;
        card.difficulty = null;
        card.lastSeen = null;
        card.attempts = 0;

        // Save progress and refresh the current card
        this.saveProgress();
        this.showCurrentCard();
    }

    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        localStorage.setItem('cardPreferences', JSON.stringify(this.preferences));
    }

    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
        const savedPreferences = localStorage.getItem('cardPreferences');

        if (savedPreferences) {
            return JSON.parse(savedPreferences);
        }

        // Default preferences
        return {
            shuffle: false,
            categoryFilter: null,
            difficultyFilter: null,
            maxCards: 0 // 0 means no limit
        };
    }

    /**
     * Get the study session results
     */
    getResults() {
        const duration = new Date() - this.sessionStats.started;

        return {
            ...this.sessionStats.results,
            totalCards: this.filteredCards.length,
            completedCards: this.sessionStats.cardsReviewed,
            duration: Math.floor(duration / 1000), // in seconds
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Toggle reversed mode
     */
    toggleReversedMode() {
        this.isReversedMode = !this.isReversedMode;
        console.log("Reversed mode:", this.isReversedMode);
        this.showCurrentCard(); // Refresh the current card display
    }
}
