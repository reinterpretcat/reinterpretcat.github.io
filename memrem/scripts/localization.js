/**
 * Localization Module
 * 
 * Provides translation support for multiple languages
 */
export class Localization {
    constructor() {
        this.translations = {
            en: {
                // General UI
                appTitle: "Memory Remains",
                back: "Back",
                apply: "Apply",
                cancel: "Cancel",
                search: "Search files...",
                path: "Path",
                root: "root",

                // File explorer
                noItemsSelected: "No items selected",
                selectedFiles: "Selected <strong>{0}</strong> {1}",
                filesLabel: "file",
                filesLabelPlural: "files",
                fromFolders: "from <strong>{0}</strong> {1}",
                folderLabel: "folder",
                folderLabelPlural: "folders",
                emptyFolder: "Empty folder",
                selectFileMessage: "Select this file to include all cards",
                previewHeader: "This file contains {0} card(s):",
                noCards: "No card sections found in this file",

                // Card system
                showAnswer: "Show Answer",
                easy: "Easy",
                medium: "Medium",
                hard: "Hard",
                cardsProgress: "{0}/{1} cards",
                srsProgress: "{0} of {1} cards due for review",
                sessionComplete: "Session Complete",
                noCardsAvailable: "No cards available",
                goBackSelectFiles: "Please go back and select content files",
                allCardsScheduled: "All cards are scheduled for future review.",
                resetAllSrs: "Reset All SRS Data",
                nextReview: "Next review",
                interval: "Interval",
                days: "days",

                // Session stats
                congratulations: "🎉 Congratulations! 🎉",
                masteredCards: "You have mastered all the cards in this session.",
                reviewedCards: "Reviewed cards:",
                timeSpent: "Time spent:",
                markedEasy: "Marked as easy:",
                markedMedium: "Marked as medium:",
                markedHard: "Marked as hard:",
                startNewSession: "Start New Session",

                // Chat
                chatTitle: "Chat about: {0}",
                chatPlaceholder: "Type your message...",
                send: "Send",
                chatWithLlm: "Chat with LLM",
                learnCards: "Learn Cards",
                backToFileExplorer: "Back to File Explorer",
                whatToDo: "What would you like to do?",
                generateCards: "Generate Similar Cards",
                generateCardsPrompt: "Generate 10 more language cards similar to the ones in the content. Use the exact same format and languages as the example content.",
                explainGrammar: "Explain Grammar Rules",
                explainGrammarPrompt: "Explain the grammar rules related to the content I'm studying. Focus on the patterns shown in the examples.",
                practiceExercises: "Create Practice Exercises",
                practiceExercisesPrompt: "Create 5 practice exercises using the vocabulary and grammar from the examples that will help me master their usage.",
                usageExamples: "Get Usage Examples",
                usageExamplesPrompt: "For each term in the content, provide 2 additional example sentences showing how to use it in different contexts.",
                apiError: "There was an error connecting to the AI service. Please try again later.",
                generationError: "Sorry, I couldn't generate a response. Please try again.",

                // Settings
                settings: "Settings",
                appearance: "Appearance",
                lightMode: "Light Mode",
                cardBehavior: "Card Behavior",
                shuffleCards: "Shuffle Cards",
                shuffleDescription: "Randomizes card order to prevent sequence-based memorization.",
                reversedMode: "Reversed Mode",
                reversedDescription: "Swaps questions and answers for bidirectional learning.",
                studyOptions: "Study Options",
                enableSrs: "Enable Spaced Repetition",
                srsDescription: "Uses intelligent algorithm to optimize review intervals.",
                maxCards: "Max Cards:",
                maxCardsDescription: "Limit the number of cards (0 = no limit).",
                filterByTags: "Filter by Tags",
                searchTags: "Type to search tags...",
                matchAnyTag: "Match any tag",
                matchAllTags: "Match all tags",
                filterTagsDescription: "Filter cards by tags. Type to see available options.",
                language: "Language",
                languageDescription: "Change the interface language.",
            },
            de: {
                // General UI
                appTitle: "Memory Remains",
                back: "Zurück",
                apply: "Anwenden",
                cancel: "Abbrechen",
                search: "Dateien suchen...",
                path: "Pfad",
                root: "Stammverzeichnis",

                // File explorer
                noItemsSelected: "Keine Elemente ausgewählt",
                selectedFiles: "<strong>{0}</strong> {1} ausgewählt",
                filesLabel: "Datei",
                filesLabelPlural: "Dateien",
                fromFolders: "aus <strong>{0}</strong> {1}",
                folderLabel: "Ordner",
                folderLabelPlural: "Ordnern",
                emptyFolder: "Leerer Ordner",
                selectFileMessage: "Wählen Sie diese Datei aus, um alle Karten einzuschließen",
                previewHeader: "Diese Datei enthält {0} Karte(n):",
                noCards: "Keine Kartenabschnitte in dieser Datei gefunden",

                // Card system
                showAnswer: "Antwort zeigen",
                easy: "Einfach",
                medium: "Mittel",
                hard: "Schwer",
                cardsProgress: "{0}/{1} Karten",
                srsProgress: "{0} von {1} Karten zur Überprüfung fällig",
                sessionComplete: "Sitzung abgeschlossen",
                noCardsAvailable: "Keine Karten verfügbar",
                goBackSelectFiles: "Bitte gehen Sie zurück und wählen Sie Inhaltsdateien aus",
                allCardsScheduled: "Alle Karten sind für die zukünftige Überprüfung geplant.",
                resetAllSrs: "Alle SRS-Daten zurücksetzen",
                nextReview: "Nächste Überprüfung",
                interval: "Intervall",
                days: "Tage",

                // Session stats
                congratulations: "🎉 Herzlichen Glückwunsch! 🎉",
                masteredCards: "Sie haben alle Karten in dieser Sitzung gemeistert.",
                reviewedCards: "Überprüfte Karten:",
                timeSpent: "Aufgewendete Zeit:",
                markedEasy: "Als einfach markiert:",
                markedMedium: "Als mittel markiert:",
                markedHard: "Als schwer markiert:",
                startNewSession: "Neue Sitzung starten",

                // Chat
                chatTitle: "Chat über: {0}",
                chatPlaceholder: "Nachricht eingeben...",
                send: "Senden",
                chatWithLlm: "Mit LLM chatten",
                learnCards: "Karten lernen",
                backToFileExplorer: "Zurück zum Datei-Explorer",
                whatToDo: "Was möchten Sie tun?",
                generateCards: "Ähnliche Karten generieren",
                generateCardsPrompt: "Erstelle 10 weitere Sprachkarten ähnlich zu denen im vorhandenen Inhalt. Verwende genau das gleiche Format und die gleichen Sprachen wie im Beispielinhalt.",
                explainGrammar: "Grammatikregeln erklären",
                explainGrammarPrompt: "Erkläre die Grammatikregeln, die sich auf den Inhalt beziehen, den ich lerne. Konzentriere dich auf die Muster, die in den Beispielen gezeigt werden.",
                practiceExercises: "Übungen erstellen",
                practiceExercisesPrompt: "Erstelle 5 Übungsaufgaben mit dem Vokabular und der Grammatik aus den Beispielen, die mir helfen werden, deren Verwendung zu meistern.",
                usageExamples: "Verwendungsbeispiele erhalten",
                usageExamplesPrompt: "Gib für jeden Begriff im Inhalt 2 zusätzliche Beispielsätze, die zeigen, wie man ihn in verschiedenen Kontexten verwendet.",
                apiError: "Es gab einen Fehler bei der Verbindung zum KI-Dienst. Bitte versuchen Sie es später erneut.",
                generationError: "Entschuldigung, ich konnte keine Antwort generieren. Bitte versuchen Sie es erneut.",

                // Settings
                settings: "Einstellungen",
                appearance: "Aussehen",
                lightMode: "Licht-Modus",
                cardBehavior: "Kartenverhalten",
                shuffleCards: "Karten mischen",
                shuffleDescription: "Randomisiert die Kartenreihenfolge, um sequenzbasiertes Auswendiglernen zu verhindern.",
                reversedMode: "Umgekehrter Modus",
                reversedDescription: "Tauscht Fragen und Antworten für bidirektionales Lernen.",
                studyOptions: "Lernoptionen",
                enableSrs: "Aktiviere Spaced Repetition",
                srsDescription: "Verwendet einen intelligenten Algorithmus zur Optimierung der Wiederholungsintervalle.",
                maxCards: "Max. Karten:",
                maxCardsDescription: "Begrenzt die Anzahl der Karten (0 = keine Begrenzung).",
                filterByTags: "Nach Tags filtern",
                searchTags: "Tippen, um nach Tags zu suchen...",
                matchAnyTag: "Beliebigen Tag abgleichen",
                matchAllTags: "Alle Tags abgleichen",
                filterTagsDescription: "Filtere Karten nach Tags. Tippe, um verfügbare Optionen zu sehen.",
                language: "Sprache",
                languageDescription: "Ändere die Benutzeroberflächen-Sprache.",
            },
            ru: {
                // General UI
                appTitle: "Memory Remains",
                back: "Назад",
                apply: "Применить",
                cancel: "Отмена",
                search: "Поиск файлов...",
                path: "Путь",
                root: "корень",

                // File explorer
                noItemsSelected: "Элементы не выбраны",
                selectedFiles: "Выбрано <strong>{0}</strong> {1}",
                filesLabel: "файл",
                filesLabelPlural: "файлов",
                fromFolders: "из <strong>{0}</strong> {1}",
                folderLabel: "папки",
                folderLabelPlural: "папок",
                emptyFolder: "Пустая папка",
                selectFileMessage: "Выберите этот файл, чтобы включить все карточки",
                previewHeader: "Этот файл содержит {0} карточек:",
                noCards: "В этом файле не найдено разделов карточек",

                // Card system
                showAnswer: "Показать ответ",
                easy: "Легко",
                medium: "Средне",
                hard: "Трудно",
                cardsProgress: "{0}/{1} карточек",
                srsProgress: "{0} из {1} карточек для повторения",
                sessionComplete: "Сессия завершена",
                noCardsAvailable: "Нет доступных карточек",
                goBackSelectFiles: "Пожалуйста, вернитесь назад и выберите файлы содержимого",
                allCardsScheduled: "Все карточки запланированы для будущего повторения.",
                resetAllSrs: "Сбросить все данные SRS",
                nextReview: "Следующее повторение",
                interval: "Интервал",
                days: "дней",

                // Session stats
                congratulations: "🎉 Поздравляем! 🎉",
                masteredCards: "Вы освоили все карточки в этой сессии.",
                reviewedCards: "Просмотрено карточек:",
                timeSpent: "Затраченное время:",
                markedEasy: "Отмечено как легко:",
                markedMedium: "Отмечено как средне:",
                markedHard: "Отмечено как трудно:",
                startNewSession: "Начать новую сессию",

                // Chat
                chatTitle: "Чат о: {0}",
                chatPlaceholder: "Введите сообщение...",
                send: "Отправить",
                chatWithLlm: "Чат с LLM",
                learnCards: "Учить карточки",
                backToFileExplorer: "Вернуться к файловому проводнику",
                whatToDo: "Что бы вы хотели сделать?",
                generateCards: "Создать похожие карточки",
                generateCardsPrompt: "Создайте ещё 10 языковых карточек, похожих на те, что в содержании. Используйте точно такой же формат и языки, как в примере.",
                explainGrammar: "Объяснить правила грамматики",
                explainGrammarPrompt: "Объясните грамматические правила, связанные с содержанием, которое я изучаю. Сосредоточьтесь на закономерностях, показанных в примерах.",
                practiceExercises: "Создать упражнения",
                practiceExercisesPrompt: "Создайте 5 практических упражнений, используя словарный запас и грамматику из примеров, которые помогут мне освоить их использование.",
                usageExamples: "Получить примеры использования",
                usageExamplesPrompt: "Для каждого термина в содержании предоставьте 2 дополнительных примера предложений, показывающих, как его использовать в разных контекстах.",
                apiError: "Произошла ошибка при подключении к сервису ИИ. Пожалуйста, попробуйте позже.",
                generationError: "Извините, я не смог сгенерировать ответ. Пожалуйста, попробуйте еще раз.",

                // Settings
                settings: "Настройки",
                appearance: "Внешний вид",
                lightMode: "Светлый режим",
                cardBehavior: "Поведение карточек",
                shuffleCards: "Перемешать карточки",
                shuffleDescription: "Рандомизирует порядок карточек для предотвращения запоминания на основе последовательности.",
                reversedMode: "Обратный режим",
                reversedDescription: "Меняет местами вопросы и ответы для двунаправленного обучения.",
                studyOptions: "Параметры обучения",
                enableSrs: "Включить интервальное повторение",
                srsDescription: "Использует интеллектуальный алгоритм для оптимизации интервалов повторения.",
                maxCards: "Макс. карточек:",
                maxCardsDescription: "Ограничивает количество карточек (0 = без ограничения).",
                filterByTags: "Фильтровать по тегам",
                searchTags: "Введите для поиска тегов...",
                matchAnyTag: "Совпадение с любым тегом",
                matchAllTags: "Совпадение со всеми тегами",
                filterTagsDescription: "Фильтровать карточки по тегам. Введите для просмотра доступных вариантов.",
                language: "Язык",
                languageDescription: "Изменить язык интерфейса.",
            }
        };

        // Get stored language preference or default to English
        this.currentLanguage = localStorage.getItem('appLanguage') || 'en';
    }

    /**
     * Get translation for the given key
     * @param {string} key - Translation key
     * @param {...any} args - Optional arguments for formatting
     * @returns {string} - Translated text
     */
    get(key, ...args) {
        const lang = this.currentLanguage;
        let translation = '';

        // Get translation from current language or fallback to English
        if (this.translations[lang] && this.translations[lang][key]) {
            translation = this.translations[lang][key];
        } else if (this.translations['en'] && this.translations['en'][key]) {
            translation = this.translations['en'][key];
        } else {
            console.warn(`Translation missing for key: ${key}`);
            return key; // Return the key as fallback
        }

        // Format the translation if args are provided
        if (args.length > 0) {
            for (let i = 0; i < args.length; i++) {
                translation = translation.replace(`{${i}}`, args[i]);
            }
        }

        return translation;
    }

    /**
     * Change the current language
     * @param {string} language - Language code ('en', 'de', 'ru')
     */
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            localStorage.setItem('appLanguage', language);
            return true;
        }
        return false;
    }

    /**
     * Get current language
     * @returns {string} - Current language code
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get list of available languages
     * @returns {Array<{code: string, name: string}>} - Array of language objects
     */
    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'de', name: 'Deutsch' },
            { code: 'ru', name: 'Русский' }
        ];
    }

    /**
     * Update all UI elements with translations
     */
    updateUI() {
        document.title = this.get('appTitle');

        // Update static elements by their IDs
        const elementsToUpdate = {
            'back-button': 'back',
            'search-input': 'search',
            'selection-stats': 'noItemsSelected',
            'chat-llm-button': 'chatWithLlm',
            'continue-button': 'learnCards',
            'show-answer-button': 'showAnswer',
            'back-to-selection': 'back',
            'back-to-file-explorer': 'backToFileExplorer',
            'chat-input': { placeholder: 'chatPlaceholder' },
            'chat-send-button': 'send'
        };

        for (const [id, key] of Object.entries(elementsToUpdate)) {
            const element = document.getElementById(id);
            if (element) {
                if (typeof key === 'string') {
                    element.textContent = this.get(key);
                } else if (typeof key === 'object') {
                    for (const [attr, attrKey] of Object.entries(key)) {
                        element.setAttribute(attr, this.get(attrKey));
                    }
                }
            }
        }

        this.formatPathIndicator();

        // Update difficulty buttons
        const difficultyButtons = document.querySelectorAll('.difficulty-button');
        const difficulties = ['easy', 'medium', 'hard'];
        difficultyButtons.forEach((button, index) => {
            if (index < difficulties.length) {
                button.textContent = this.get(difficulties[index]);
            }
        });

        // Update settings modal
        this.updateSettingsUI();
    }

    /**
     * Format the path indicator text
     */
    formatPathIndicator() {
        const pathIndicator = document.getElementById('path-indicator');

        const currentText = pathIndicator.textContent;
        const pathParts = currentText.split(':');

        if (pathParts.length > 1) {
            const pathValue = pathParts[1].trim();
            if (pathValue === 'root') {
                pathIndicator.textContent = `${this.get('path')}: ${this.get('root')}`;
            } else {
                pathIndicator.textContent = `${this.get('path')}: ${pathValue}`;
            }
        } else {
            pathIndicator.textContent = `${this.get('path')}: ${this.get('root')}`;
        }
    }

    /**
     * Update settings UI with translations
     */
    updateSettingsUI() {
        const settingsElements = {
            // Settings heading
            '#settings-modal .modal-content h2': 'settings',

            // Left column
            '.settings-section h3:nth-of-type(1)': 'appearance',
            '.theme-toggle-container .setting-label': 'lightMode',
            '.settings-section h3:nth-of-type(2)': 'cardBehavior',
            'label[for="shuffle-cards"] .setting-label': 'shuffleCards',
            'label[for="shuffle-cards"] + p': 'shuffleDescription',
            'label[for="reversed-mode"] .setting-label': 'reversedMode',
            'label[for="reversed-mode"] + p': 'reversedDescription',

            // Right column
            '.settings-column:nth-child(2) .settings-section h3': 'studyOptions',
            'label[for="srs-mode"] .setting-label': 'enableSrs',
            'label[for="srs-mode"] + p': 'srsDescription',
            'label[for="max-cards"]': 'maxCards',
            '#max-cards-container + p': 'maxCardsDescription',

            // Tags section
            '#tag-filter-container h3': 'filterByTags',
            '#tag-filter': { placeholder: 'searchTags' },
            '.filter-rule-container label:nth-child(1) span': 'matchAnyTag',
            '.filter-rule-container label:nth-child(2) span': 'matchAllTags',
            '#tag-filter-container p.settings-description': 'filterTagsDescription',

            // Language section (if it exists)
            '#language-section h3': 'language',
            '#language-section p': 'languageDescription',

            // Buttons
            '#apply-settings': 'apply',
            '#close-settings': 'cancel',
        };

        // Update elements
        for (const [selector, key] of Object.entries(settingsElements)) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (typeof key === 'string') {
                    element.textContent = this.get(key);
                } else if (typeof key === 'object') {
                    for (const [attr, attrKey] of Object.entries(key)) {
                        element.setAttribute(attr, this.get(attrKey));
                    }
                }
            });
        }
    }
}

// Create and export a singleton instance
export const i18n = new Localization();