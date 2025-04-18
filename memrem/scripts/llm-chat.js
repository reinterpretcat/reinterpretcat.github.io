/**
 * LLM Chat Module
 * 
 * Handles chat interactions with OpenRouter API for LLM integration.
 */
export class LLMChat {
    constructor(elements) {
        // Store DOM elements
        this.elements = elements;

        // Chat state
        this.isInChatMode = false;
        this.chatHistory = [];

        // Initialize additional elements from HTML
        this.initializeElements();

        // Store extracted card content
        this.extractedCardContent = null;

        // Current context for the chat
        this.currentContext = null;
    }

    /**
     * Initialize the chat interface elements from HTML
     */
    initializeElements() {
        // Get references to the chat screen container
        this.elements.chatScreen = document.getElementById('llm-chat-screen');

        // Get references to the HTML elements within the chat screen
        this.elements.chatContainer = document.getElementById('chat-container');
        this.elements.chatMessages = document.getElementById('chat-messages');
        this.elements.chatInput = document.getElementById('chat-input');
        this.elements.chatSendButton = document.getElementById('chat-send-button');
        this.elements.backToFileExplorer = document.getElementById('back-to-file-explorer');
        this.elements.chatTitle = document.getElementById('chat-title');

        // Set up event listeners
        if (this.elements.chatSendButton) {
            this.elements.chatSendButton.addEventListener('click', () => this.sendChatMessage());
        }

        if (this.elements.backToFileExplorer) {
            this.elements.backToFileExplorer.addEventListener('click', () => this.exitToFileExplorer());
        }

        // Handle enter key in textarea
        if (this.elements.chatInput) {
            this.elements.chatInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    this.sendChatMessage();
                }
            });
        }
    }

    /**
     * Initialize the chat interface
     */
    init() {
        return this;
    }

    /**
     * Start a chat session with context from the current card
     */
    startChat(context) {
        this.isInChatMode = true;
        this.chatHistory = [];
        this.currentContext = context;

        // Use localization if available
        this.elements.chatTitle.textContent = window.i18n.get('chatTitle', context.title);

        window.uiController.showChatInterface();

        // Process the content from markdown files
        const contextContent = context.content || '';

        // Determine UI language and user's learning language
        const uiLang = window.i18n.getLanguage();

        // Create a context-aware system prompt for language learning
        this.chatHistory.push({
            role: "system",
            content: `
You are a helpful language learning assistant.
The user is currently learning from the following content:

${contextContent}

As a language tutor, you should:
1. Help the user understand vocabulary, grammar rules, and phrases in the material
2. Create practice exercises using the same vocabulary and grammar constructions
3. Provide examples that reinforce the learning concepts
4. Correct the user's mistakes when they try to use these constructions
5. Quiz the user on the content when they request practice
6. Use similar vocabulary and grammar structures from the original content in your answers
7. When asked to generate memory cards, use this exact format:

## [Short term/phrase in source language]
- [Ful translation in target language]
* [Full Term/Phrase in source language]
* [Optional: Additional information, conjugation, etc.]
> [Category tags based on content]

8. Explain grammar rules related to the content when asked. Do not generate memory cards for that.

Stick to the languages of the content provided. Do not switch to other languages.
Always keep your responses relevant to the user's learning material.
Maintain a supportive, encouraging tone.

The user interface language is currently set to: ${uiLang} (en=English, de=German, ru=Russian).
When possible, provide your explanations in this language to match the user's interface.`
        });

        // Create task buttons container
        this.createTaskButtons(contextContent);

        this.elements.chatInput.focus();
    }


    /**
     * Create task buttons for common language learning tasks
     */
    createTaskButtons(contextContent) {
        // Create container for task buttons
        const taskButtonsContainer = document.createElement('div');
        taskButtonsContainer.className = 'task-buttons-container';

        // Add heading for the buttons
        const heading = document.createElement('h3');
        heading.textContent = window.i18n.get('whatToDo');
        heading.className = 'task-buttons-heading';
        taskButtonsContainer.appendChild(heading);

        // Analyze context to determine the type of content
        const hasReflexiveVerbs = contextContent.toLowerCase().includes('reflexiv');
        const contextType = this.analyzeContextType(contextContent);

        // Define common tasks based on context
        const tasks = this.generateTasksBasedOnContext(contextContent, contextType);

        // Create buttons for each task
        tasks.forEach(task => {
            const button = document.createElement('button');
            button.className = 'task-button';
            button.innerHTML = `${task.icon} ${task.label}`;
            button.addEventListener('click', () => {
                this.handleTaskButtonClick(task.prompt);
            });
            taskButtonsContainer.appendChild(button);
        });

        // Add the task buttons to the chat messages
        this.elements.chatMessages.appendChild(taskButtonsContainer);
    }

    /**
     * Analyze context to determine type of content
     */
    analyzeContextType(content) {
        const contentLower = content.toLowerCase();
        let type = {
            isReflexive: contentLower.includes('reflexiv'),
            isVerb: contentLower.includes('verb'),
            isNoun: contentLower.includes('substantiv'),
            isAdjective: contentLower.includes('adjektiv'),
            hasPhrase: contentLower.includes('phrase')
        };

        return type;
    }

    /**
     * Generate tasks based on context
     */
    generateTasksBasedOnContext(context, contextType) {
        // Extract a sample line to determine the languages involved
        const lines = context.split('\n');
        let sampleTermLine = '';
        let sampleTranslationLine = '';

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('##')) {
                sampleTermLine = lines[i];
                if (i + 1 < lines.length && lines[i + 1].startsWith('-')) {
                    sampleTranslationLine = lines[i + 1];
                    break;
                }
            }
        }

        // Use localization for task labels and prompts if available
        const i18n = window.i18n;

        // Default tasks that work for any language content
        return [
            {
                label: i18n.get('generateCards'),
                prompt: i18n.get('generateCardsPrompt'),
                icon: '🃏'
            },
            {
                label: i18n.get('explainGrammar'),
                prompt: i18n.get('explainGrammarPrompt'),
                icon: '📚'
            },
            {
                label: i18n.get('practiceExercises'),
                prompt: i18n.get('practiceExercisesPrompt'),
                icon: '✏️'
            },
            {
                label: i18n.get('usageExamples'),
                prompt: i18n.get('usageExamplesPrompt'),
                icon: '💬'
            }
        ];
    }

    /**
     * Handle task button click
     */
    handleTaskButtonClick(prompt) {
        // Add user message with the prompt
        this.addChatMessage(prompt, 'user');

        // Send to API
        const loadingElement = this.addChatMessage('...', 'loading');

        // Call API
        this.callOpenRouterAPI(prompt)
            .then(response => {
                // Remove loading indicator
                loadingElement.remove();

                // Add response
                if (response) {
                    this.addChatMessage(response, 'assistant');
                } else {
                    this.addChatMessage(window.i18n.get('generationError'), 'assistant');
                }
            })
            .catch(error => {
                console.error('Error calling LLM API:', error);
                loadingElement.remove();
                const errorMsg = window.i18n.get('apiError');
                this.addChatMessage(errorMsg, 'assistant');
            });
    }

    /**
     * Add a message to the chat UI
     */
    addChatMessage(message, role) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${role}-message`;

        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';

        // Replace newlines with <br> tags to preserve formatting
        if (message === '...') {
            contentElement.textContent = message;
        } else {
            contentElement.innerHTML = message.replace(/\n/g, '<br>');
        }

        messageElement.appendChild(contentElement);
        this.elements.chatMessages.appendChild(messageElement);

        // Scroll to bottom
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;

        // Add to chat history if not a loading message
        if (message !== '...' && role !== 'loading') {
            this.chatHistory.push({
                role: role,
                content: message
            });
        }

        // Check if assistant message contains card content
        if (role === 'assistant') {
            const extractedContent = this.detectCardContent(message);
            if (extractedContent) {
                // Create a Learn Cards button
                const learnCardsButton = document.createElement('button');
                learnCardsButton.className = 'learn-cards-button';
                learnCardsButton.textContent = window.i18n.get('learnCards');
                learnCardsButton.addEventListener('click', () => this.handleLearnCardsClick(extractedContent));

                // Add button after the message content
                messageElement.appendChild(learnCardsButton);

                // Store the extracted content
                this.extractedCardContent = extractedContent;
            }
        }

        return messageElement;
    }

    /**
     * Detect if a message contains card content (sections starting with ##)
     */
    detectCardContent(message) {
        // Regular expression to match content in the format used for cards
        const cardPattern = /##\s+([^\n]+)\n-\s+([^\n]+)(\n\*\s+([^\n]+))?(\n>\s+([^\n]+))?/g;
        const matches = Array.from(message.matchAll(cardPattern));

        if (matches.length === 0) {
            return null;
        }

        // Format the extracted content as markdown
        let markdownContent = "# LLM Generated Cards\n\n";

        matches.forEach(match => {
            const title = match[1].trim();
            const question = match[2].trim();
            const answer = match[4] ? match[4].trim() : "";
            const tags = match[6] ? match[6].trim() : "generated";

            markdownContent += `## ${title}\n`;
            markdownContent += `- ${question}\n`;
            if (answer) {
                markdownContent += `* ${answer}\n`;
            }
            markdownContent += `> ${tags}\n\n`;
        });

        return markdownContent;
    }

    /**
     * Handle click on Learn Cards button
     */
    handleLearnCardsClick(content) {
        if (!content || !window.fileExplorer) {
            console.error('Cannot handle Learn Cards: missing content or file explorer');
            return;
        }

        // Create a temporary file in memory to hold the card content
        const tempFileName = 'llm_generated_cards.md';

        // Add the content to file explorer's state
        window.fileExplorer.state.fileContents = window.fileExplorer.state.fileContents || {};
        window.fileExplorer.state.fileContents[tempFileName] = content;

        // Set the cards in the card system
        if (window.cardSystem) {
            window.cardSystem.setCards([tempFileName]);
            window.uiController.showMemorizationCards();
        } else {
            console.error('Card system not available');
        }

        console.log('Created learning cards from LLM content');
    }

    /**
     * Send a message to the LLM API
     */
    async sendChatMessage() {
        const userMessage = this.elements.chatInput.value.trim();
        if (!userMessage) return;

        // Clear input
        this.elements.chatInput.value = '';

        // Add user message to UI
        this.addChatMessage(userMessage, 'user');

        // Add loading indicator
        const loadingElement = this.addChatMessage('...', 'loading');

        try {
            // Send to OpenRouter API
            const response = await this.callOpenRouterAPI(userMessage);

            // Remove loading indicator
            loadingElement.remove();

            // Add response to UI
            if (response) {
                this.addChatMessage(response, 'assistant');
            } else {
                this.addChatMessage(window.i18n.get('generationError'), 'assistant');
            }
        } catch (error) {
            console.error('Error calling LLM API:', error);

            // Remove loading indicator
            loadingElement.remove();

            // Show error message
            this.addChatMessage(window.i18n.get('apiError'), 'assistant');
        }
    }

    /**
     * Call the OpenRouter API
     */
    async callOpenRouterAPI(userMessage) {
        // Add the user message to history
        this.chatHistory.push({
            role: "user",
            content: userMessage
        });

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getOpenRouterKey()}`,
                    'HTTP-Referer': window.location.origin, // Required by OpenRouter
                },
                body: JSON.stringify({
                    // https://openrouter.ai/rankings
                    model: 'deepseek/deepseek-chat-v3-0324:free',
                    messages: this.chatHistory,
                    route: 'fallback',
                    max_tokens: 2048
                })
            });

            if (!response.ok) {
                // Try to parse error response
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (e) {
                    // If can't parse JSON, use status text
                    errorData = { error: { message: response.statusText } };
                }

                console.error('OpenRouter API error:', errorData);
                throw new Error(`API returned ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
            }

            // Parse response
            const data = await response.json();
            console.log('OpenRouter API response:', data);

            // Validate response structure
            if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
                console.error('Invalid response format from OpenRouter API:', data);
                throw new Error('Invalid response format from API');
            }

            // Extract assistant response safely
            const assistantResponse = data.choices[0]?.message?.content;

            if (!assistantResponse) {
                console.error('No content in API response:', data);
                throw new Error('No content in API response');
            }

            // Add assistant response to history
            this.chatHistory.push({
                role: "assistant",
                content: assistantResponse
            });

            return assistantResponse;
        } catch (error) {
            console.error('Error calling OpenRouter API:', error);
            throw error;
        }
    }

    /**
     * Get OpenRouter API key from local storage or prompt user
     */
    getOpenRouterKey() {
        let apiKey = localStorage.getItem('openrouter_api_key');

        if (!apiKey) {
            apiKey = prompt("Please enter your OpenRouter API key. You can get one at openrouter.ai");
            if (apiKey) {
                localStorage.setItem('openrouter_api_key', apiKey);
            }
        }

        return apiKey;
    }

    /**
     * Exit chat mode and go back to file explorer
     */
    exitToFileExplorer() {
        this.isInChatMode = false;

        // Use UI controller if available
        if (window.uiController && typeof window.uiController.showFileExplorer === 'function') {
            window.uiController.showFileExplorer();
        } else {
            // Fallback if uiController is not available
            // Hide chat screen
            if (this.elements.chatScreen) {
                this.elements.chatScreen.style.display = 'none';
                this.elements.chatScreen.classList.add('hidden');
            }

            if (this.elements.memorizationCards) {
                this.elements.memorizationCards.classList.add('hidden');
                this.elements.memorizationCards.style.display = 'none';
            }

            // Show the panels
            const panels = document.getElementById('panels');
            if (panels) {
                panels.style.display = 'flex';
                panels.classList.remove('hidden');
            }

            // Show the navigation bar
            const navigationBar = document.getElementById('navigation-bar');
            if (navigationBar) {
                navigationBar.style.display = 'flex';
                navigationBar.classList.remove('hidden');
            }

            // Show the bottom buttons
            const bottomButtonsContainer = document.querySelector('.split-button-container');
            if (bottomButtonsContainer) {
                bottomButtonsContainer.style.display = 'flex';
            }
        }

        // Clear chat messages for next time
        if (this.elements.chatMessages) {
            this.elements.chatMessages.innerHTML = '';
        }

        // Reset chat history
        this.chatHistory = [];

        // Call exit callback if set
        if (typeof this.onExitChat === 'function') {
            this.onExitChat();
        }
    }

    /**
     * Set callback for when chat is exited
     */
    setExitCallback(callback) {
        this.onExitChat = callback;
    }

    /**
     * Check if currently in chat mode
     */
    isInChat() {
        return this.isInChatMode;
    }
}