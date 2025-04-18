/**
 * File Explorer Module
 * 
 * A self-contained file explorer component that provides navigation and selection capabilities.
 */

export class FileExplorer {
    constructor(elements) {
        // Store DOM elements
        this.elements = elements;

        // Panel constants - keep same structure as original
        this.PANEL = {
            LEFT: 0,
            MIDDLE: 1,
            RIGHT: 2,
            names: ['left', 'middle', 'right']
        };

        // Selection states for better readability
        this.SELECTION = {
            NONE: 'none',
            PARTIAL: 'partial',
            FULL: 'full'
        };

        // Application state
        this.state = {
            contentTree: {},
            selectedItems: new Set(),
            currentPath: [],
            selectedFile: null,
            activePanel: this.PANEL.MIDDLE,
            activeIndex: [0, 0, 0],
            middlePanelSelectedItems: new Set(),
            rightPanelSelectedItems: new Set(),
            folderSelectionState: {},
            searchQuery: '', // Add search query state
            searchResults: [], // Add search results state
            searchActive: false, // Flag to indicate if search is active
            originalMiddlePanelContent: null, // Store original content when searching
        };

        this.onCardLearningCallback = null;
        this.chatLLMButtonCallback = null;

        // Add a property to store the long press timer
        this.longPressTimer = null;
    }

    /**
     * Initialize the file explorer
     */
    async init() {
        this.setupUI();
        await this.loadContent();
        return this; // For chaining
    }

    /**
     * Register callback for card learning
     */
    onCardLearning(callback) {
        this.onCardLearningCallback = callback;
        return this;
    }

    /**
     * Register callback for Chat with LLM
    */
    onChatLLM(callback) {
        this.onChatLLMCallback = callback;
        return this;
    }

    /**
     * Setup UI components
     */
    setupUI() {
        this.setupNavigationBar();
        this.setupKeyboardNavigation();
        this.setupTouchMouseSelection();
        this.setupButtonHandlers();
    }

    /**
     * Setup button handlers for Card Learning and Chat with LLM buttons
     */
    setupButtonHandlers() {
        this.elements.cardLearningButton.addEventListener("click", () => this.onCardLearningCallback(this.getAllSelectedFiles()));
        this.elements.chatLLMButton.addEventListener("click", () => this.onChatLLMCallback(this.getAllSelectedFiles()));
    }

    /**
     * Setup touch/mouse selection for elements with long press detection
     */
    setupTouchMouseSelection() {
        [this.PANEL.LEFT, this.PANEL.MIDDLE, this.PANEL.RIGHT].forEach(panelIndex => {
            const panel = this.getPanelElement(panelIndex);

            if (!panel) {
                console.warn(`Panel ${panelIndex} not found. Skipping touch/mouse selection.`);
                return;
            }

            // Use a separate variable for each panel to ensure proper state tracking
            let isLongPress = false;
            let touchStartY = 0;
            let touchIdentifier = null;
            let hasMoved = false;
            const MOVE_THRESHOLD = 10; // Pixels threshold to detect scrolling vs selection

            // Add touchstart listener with passive: true to allow scrolling
            panel.addEventListener("touchstart", (event) => {
                // Store initial touch position for movement detection
                if (event.touches.length === 1) {
                    const touch = event.touches[0];
                    touchStartY = touch.clientY;
                    touchIdentifier = touch.identifier;
                    hasMoved = false;
                }

                // Don't call preventDefault here to allow scrolling
                this.startLongPress(event, panelIndex, () => { isLongPress = true; });
            }, { passive: true });

            // Add touchmove to detect scrolling intention
            panel.addEventListener("touchmove", (event) => {
                if (touchIdentifier !== null && event.touches.length === 1) {
                    const touch = event.touches[0];
                    // Check if user has moved enough to consider it a scroll
                    if (Math.abs(touch.clientY - touchStartY) > MOVE_THRESHOLD) {
                        hasMoved = true;
                        // Cancel long press timer if user is scrolling
                        if (this.longPressTimer) {
                            clearTimeout(this.longPressTimer);
                            this.longPressTimer = null;
                        }
                    }
                }
            }, { passive: true });

            // Use regular mouse events for desktop
            panel.addEventListener("mousedown", (event) => {
                // We can prevent default for mouse as it doesn't affect scrolling
                event.preventDefault();
                this.startLongPress(event, panelIndex, () => { isLongPress = true; });
            });

            // Add touchend with improved handling
            panel.addEventListener("touchend", (event) => {
                if (hasMoved) {
                    // User was scrolling, don't interfere
                    isLongPress = false;
                    if (this.longPressTimer) {
                        clearTimeout(this.longPressTimer);
                        this.longPressTimer = null;
                    }
                } else {
                    // Only prevent default if it was a tap, not a scroll
                    if (isLongPress) {
                        event.preventDefault();
                    }
                    this.clearLongPress(event, () => isLongPress && !hasMoved);
                }
                // Reset state
                isLongPress = false;
                touchIdentifier = null;
            });

            panel.addEventListener("touchcancel", () => {
                this.clearLongPress(null, () => false);
                isLongPress = false;
                touchIdentifier = null;
            });

            panel.addEventListener("mouseup", (event) => {
                this.clearLongPress(event, () => isLongPress);
                isLongPress = false;
            });

            panel.addEventListener("mouseleave", () => {
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
                isLongPress = false;
            });
        });
    }

    /**
     * Start long press detection
     */
    startLongPress(event, panelIndex, setLongPressFlag) {
        // Don't prevent default here to allow scrolling

        // Clear any existing timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }

        this.longPressTimer = setTimeout(() => {
            setLongPressFlag();
            const element = event.target.closest(".folder, .file");
            if (element) {
                this.handleLongPress(element, panelIndex);
            }
        }, 500); // Long press threshold (500ms)
    }

    /**
     * Clear long press detection
     */
    clearLongPress(event, isLongPress) {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        // If it was a long press, prevent the default click behavior
        if (event && isLongPress()) {
            event.preventDefault();
            return;
        }

        // Otherwise, handle as a regular click
        if (event && (event.type === "mouseup" || event.type === "touchend")) {
            const element = event.target.closest(".folder, .file");
            if (element) {
                // Determine which panel was clicked
                let panelIndex;
                if (this.elements.leftPanel.contains(element)) {
                    panelIndex = this.PANEL.LEFT;
                } else if (this.elements.middlePanel.contains(element)) {
                    panelIndex = this.PANEL.MIDDLE;
                } else if (this.elements.rightPanel.contains(element)) {
                    panelIndex = this.PANEL.RIGHT;
                }
                this.handlePanelClick(event, panelIndex);
            }
        }
    }

    /**
     * Handle long press
     */
    handleLongPress(element, panelIndex) {
        this.handleSelectionLogic(element);
    }

    /**
     * Shared selection logic for space key and long press
     */
    handleSelectionLogic(element) {
        const item = element.dataset.item;

        if (this.state.activePanel === this.PANEL.RIGHT) {
            this.toggleItemSelection(item, element);
        } else if (this.state.activePanel === this.PANEL.MIDDLE) {
            if (element.classList.contains('folder')) {
                this.toggleFolderSelection(item, element);
            } else {
                this.toggleMiddlePanelItemSelection(item, element);
            }
        }

        // Update UI after selection
        this.updateAncestorFolderStates(item);
        this.updateVisibleElements();
    }

    /**
     * Load content from the index file
     */
    async loadContent(path = "content/index.md") {
        try {
            const response = await fetch(path);
            const text = await response.text();
            this.state.contentTree = this.parseMarkdownTree(text);
            this.updateUI();
            return true;
        } catch (error) {
            console.error("Failed to load content index:", error);
            this.elements.middlePanel.innerHTML = `<div class="empty-message">Error loading content: ${error.message}</div>`;
            return false;
        }
    }

    /**
     * Parse markdown tree structure
     */
    parseMarkdownTree(markdown) {
        const lines = markdown.split("\n").map(line => line.trimEnd()).filter(line => line);
        const root = { children: {} };
        const stack = [{ level: -1, node: root, path: [] }];

        lines.forEach(line => {
            const level = line.match(/^\s*/)[0].length / 4;
            const name = line.replace(/^\s*-\s*/, "");

            // Pop stack until we find a parent with a lower level
            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            const parent = stack[stack.length - 1];
            if (!parent || !parent.node.children) {
                console.error("Invalid parent structure detected while parsing Markdown tree.");
                return;
            }

            // Calculate full path for this item
            const itemPath = [...parent.path, name];
            const fullPath = itemPath.join('/');

            // Create node (without redundant fullPath property)
            const node = {
                name,
                children: {}
            };

            // Store node using the full path as key
            parent.node.children[fullPath] = node;

            // Push to stack
            stack.push({
                level,
                node,
                path: itemPath
            });
        });

        return root;
    }

    setupNavigationBar() {
        // Get references to the navigation elements that are now in HTML
        const backButton = document.getElementById("back-button");
        const pathIndicator = document.getElementById("path-indicator");
        const searchIcon = document.querySelector(".search-container .search-icon");
        const searchInput = document.getElementById("search-input");
        const clearSearchButton = document.querySelector(".clear-search-button");
        const selectAllButton = document.querySelector(".select-all-button"); // Add reference to select all button

        // Set up event listeners
        backButton.addEventListener("click", () => this.navigateUp());
        searchIcon.addEventListener("click", () => this.toggleSearch());
        searchInput.addEventListener("input", () => this.handleSearch());
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.clearSearch();
                e.preventDefault();
            }
        });
        clearSearchButton.addEventListener("click", () => this.clearSearch());
        selectAllButton.addEventListener("click", () => this.selectAllVisibleFiles()); // Add event listener for select all button

        // Store references to the search elements
        this.elements.searchIcon = searchIcon;
        this.elements.searchInput = searchInput;
        this.elements.clearSearchButton = clearSearchButton;
        this.elements.selectAllButton = selectAllButton; // Store reference to select all button
        this.elements.pathIndicator = pathIndicator;
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        this.changeActivePanel(this.PANEL.MIDDLE);
    }

    updateUI() {
        this.updatePanels();
        this.updatePathIndicator();
        this.syncKeyboardNavigation();
    }

    updatePanels() {
        // Calculate folder states for current path
        if (this.state.currentPath.length > 0) {
            this.calculateFolderState(this.state.currentPath.join('/'));
        }

        // Update left panel (only show when not at root)
        if (this.state.currentPath.length > 0) {
            this.populatePanel(
                this.PANEL.names[this.PANEL.LEFT],
                this.getParentPath(),
                this.state.currentPath[this.state.currentPath.length - 1]
            );
        } else {
            this.elements.leftPanel.innerHTML = "";
        }

        // Update middle panel with current path content
        const hasMiddleItems = this.populatePanel(
            this.PANEL.names[this.PANEL.MIDDLE],
            this.state.currentPath,
            this.state.selectedFile
        );

        // Update right panel based on selection state
        if (this.state.selectedFile && hasMiddleItems) {
            // We have a file selected, show its content
            this.populateRightPanel(this.state.selectedFile);

            // Highlight the file in middle panel
            const fileElement = this.elements.middlePanel.querySelector(
                `.file[data-item="${this.state.selectedFile}"]`
            );
            if (fileElement) {
                this.highlightSelected(fileElement, this.elements.middlePanel);
            }
        } else if (!this.state.selectedFile && hasMiddleItems && this.state.activeIndex[this.PANEL.MIDDLE] === -1) {
            // No file selected but we have middle items - select the first one
            const middleItems = this.getPanelElements(this.PANEL.MIDDLE);
            if (middleItems.length > 0) {
                const firstItem = middleItems[0].dataset.item;
                this.populateRightPanel(firstItem);
                this.highlightSelected(middleItems[0], this.elements.middlePanel);
                this.state.activeIndex[this.PANEL.MIDDLE] = 0;
            }
        } else if (!hasMiddleItems) {
            // No items in middle panel, clear right panel
            this.clearRightPanel();
        }
    }

    /**
     * Navigation methods
     */
    navigateUp() {
        if (this.state.currentPath.length === 0) return false;

        // Remember which folder we're leaving
        const folderToRemember = this.state.currentPath[this.state.currentPath.length - 1];
        const currentFolderPath = this.state.currentPath.join('/');

        // Go up one level
        const newPath = this.state.currentPath.slice(0, -1);
        this.navigate(newPath, folderToRemember);

        // Update folder state and refresh UI
        this.calculateFolderState(currentFolderPath);
        this.updateVisibleElements();

        return true;
    }

    navigate(newPath, selectedItem = null) {
        const previousPath = [...this.state.currentPath];

        // Clear any active search when navigating
        if (this.state.searchActive) {
            this.clearSearch();
        }

        // If changing paths, recalculate folder states
        if (!this.arraysEqual(previousPath, newPath) && previousPath.length > 0) {
            const previousFolderPath = previousPath.join('/');
            this.calculateFolderState(previousFolderPath);

            // Only clear selections when truly changing paths, not when going back
            if (!this.isPartOfPath(previousPath, newPath) && !this.isPartOfPath(newPath, previousPath)) {
                this.state.middlePanelSelectedItems.clear();
            }
        }

        // Update state and UI
        this.state.currentPath = newPath;
        this.state.selectedFile = selectedItem;
        this.updateUI();
        this.updateSelectionStatistics();

        return {
            pathChanged: !this.arraysEqual(previousPath, newPath),
            previousPath
        };
    }

    // Check if one path is contained within another
    isPartOfPath(shorterPath, longerPath) {
        if (shorterPath.length > longerPath.length) return false;

        for (let i = 0; i < shorterPath.length; i++) {
            if (shorterPath[i] !== longerPath[i]) return false;
        }

        return true;
    }

    navigateInto(fullPath) {
        const node = this.getNodeAtCurrentPath()?.children?.[fullPath];
        if (!node) return false;

        if (this.hasChildren(node)) {
            // It's a folder, navigate into it
            const newPath = [...this.state.currentPath, fullPath];
            this.state.activeIndex[this.PANEL.MIDDLE] = -1;

            // Check if folder is selected and mark its contents
            if (this.state.folderSelectionState[fullPath] === this.SELECTION.FULL) {
                this.updateSelectionForAllChildren(node, true);
            }

            this.calculateFolderState(fullPath);
            this.navigate(newPath, null);
            this.updateVisibleElements();
        } else {
            // It's a file, stay in current folder but select the file
            this.navigate(this.state.currentPath, fullPath);
        }

        return true;
    }

    /**
     * Panel population methods
     */
    populatePanel(panelName, path, selectedItem) {
        const panel = this.elements[`${panelName}Panel`];
        const node = this.getNodeAtPath(path);

        if (!node || !this.hasChildren(node)) {
            panel.innerHTML = "<div class='empty-message'>Empty folder</div>";
            return false;
        }

        // Check if we're in a selected folder or subpath of selected folder
        let isInSelectedFolder = false;
        const currentPathStr = path.join('/');

        // Check if current folder or any ancestor is fully selected
        if (this.state.folderSelectionState[currentPathStr] === this.SELECTION.FULL) {
            isInSelectedFolder = true;
        } else {
            // Check ancestors
            let pathToCheck = '';
            for (const segment of path) {
                pathToCheck = pathToCheck ? `${pathToCheck}/${segment}` : segment;
                if (this.state.folderSelectionState[pathToCheck] === this.SELECTION.FULL) {
                    isInSelectedFolder = true;
                    break;
                }
            }
        }

        // Build the panel HTML
        const contents = Object.keys(node.children);
        panel.innerHTML = contents
            .map(fullPath => {
                const childNode = node.children[fullPath];
                const isFolder = this.hasChildren(childNode);
                const isSelected = fullPath === selectedItem;

                // Apply selection to all files when inside a fully selected folder
                const isSpaceSelected = isInSelectedFolder ||
                    this.state.middlePanelSelectedItems.has(fullPath);

                const selectionState = isFolder ?
                    (this.state.folderSelectionState[fullPath] || this.SELECTION.NONE) : undefined;

                // Format display name & additional attributes
                const displayName = childNode.name;
                const level = panelName === this.PANEL.names[this.PANEL.LEFT] ?
                    this.state.currentPath.length - 1 : undefined;

                // Set appropriate selection classes
                const selectionClass = isSpaceSelected ? ' item-selected' :
                    (selectionState === this.SELECTION.PARTIAL ? ' partially-selected' : '');

                return `<div class="${isFolder ? "folder" : "file"}${isSelected ? ' selected' : ''}${selectionClass}" 
                    data-item="${fullPath}" ${level !== undefined ? `data-level="${level}"` : ''}>${displayName}</div>`;
            })
            .join("");

        // Set left panel selection state if needed
        if (panelName === this.PANEL.names[this.PANEL.LEFT] &&
            this.state.currentPath.length > 0 && selectedItem) {
            const selectedElement = panel.querySelector('.selected');
            if (selectedElement) {
                const elements = this.getPanelElements(this.PANEL.LEFT);
                this.state.activeIndex[this.PANEL.LEFT] = Array.from(elements).indexOf(selectedElement);
            }
        }

        return contents.length > 0;
    }

    async populateRightPanel(item) {
        const currentNode = this.getNodeAtCurrentPath();
        if (!currentNode?.children?.[item]) {
            this.clearRightPanel();
            return Promise.resolve();
        }

        const selectedNode = currentNode.children[item];
        if (this.hasChildren(selectedNode)) {
            this.displayFolderContent(selectedNode);
        } else {
            await this.displayFileContent(item);
        }

        return Promise.resolve();
    }

    displayFolderContent(folderNode) {
        const subItems = Object.keys(folderNode.children);

        if (subItems.length === 0) {
            this.elements.itemsList.innerHTML = "<div class='empty-message'>Empty folder</div>";
            return;
        }

        this.elements.itemsList.innerHTML = subItems
            .map(fullPath => {
                const childNode = folderNode.children[fullPath];
                const isSubFolder = this.hasChildren(childNode);
                const displayName = childNode.name;

                return `<li class="${isSubFolder ? 'folder' : 'file'}" 
                    data-item="${fullPath}" 
                    data-display="${displayName}">${displayName}</li>`;
            })
            .join("");
    }

    /**
     * Display file content and extract card headers for preview only
     */
    async displayFileContent(fullPath) {
        const pathParts = fullPath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `content/${this.state.currentPath.map(p => {
            const parts = p.split('/');
            return parts[parts.length - 1];
        }).join("/")}/${fileName}`;

        // Load the file content
        const response = await fetch(filePath);
        if (!response.ok) {
            this.elements.itemsList.innerHTML = `<li>Error loading file: ${response.status}</li>`;
            return;
        }

        const text = await response.text();

        // Store the raw file content for card creation
        this.state.fileContents = this.state.fileContents || {};
        this.state.fileContents[fullPath] = text;

        console.log(`Loaded file content for: ${fullPath}`);

        // Extract card headers (lines starting with "## ")
        const headers = text
            .split("\n")
            .filter(line => line.trim().startsWith("## "))
            .map(line => line.replace("## ", "").trim());

        if (headers.length === 0) {
            this.elements.itemsList.innerHTML = `<li>No card sections found in this file</li>`;
            return;
        }

        // Show card sections as preview only - we'll select the whole file
        this.elements.itemsList.innerHTML = `
            <li class="preview-header">This file contains ${headers.length} card(s):</li>
            ${headers.map(header =>
            `<li class="preview-item">${header}</li>`
        ).join("")}
            <li class="select-file-message">Select this file to include all cards</li>
        `;
    }

    clearRightPanel() {
        this.elements.itemsList.innerHTML = "";
    }

    updatePathIndicator() {
        // Convert paths to display names
        const displayPath = this.state.currentPath.map(fullPath => {
            const parts = fullPath.split('/');
            return parts[parts.length - 1];
        });

        // Use localization
        const pathText = window.i18n.get('path');
        const rootText = window.i18n.get('root');

        if (displayPath.length > 0) {
            this.elements.pathIndicator.textContent = `${pathText}: ${displayPath.join(" > ")}`;
        } else {
            this.elements.pathIndicator.textContent = `${pathText}: ${rootText}`;
        }

        // Toggle back button visibility
        document.getElementById("back-button").classList.toggle('visible', this.state.currentPath.length > 0);
    }

    /**
     * Keyboard navigation
     */
    syncKeyboardNavigation() {
        this.updateSelectionIndices();
        this.restoreActivePanelFocus();
        this.syncSelectedContent();
    }

    updateSelectionIndices() {
        for (let i = 0; i < 3; i++) {
            const elements = this.getPanelElements(i);

            if (elements.length === 0) {
                this.state.activeIndex[i] = -1;
                continue;
            }

            // Keep index within bounds
            if (this.state.activeIndex[i] >= elements.length) {
                this.state.activeIndex[i] = elements.length - 1;
            }

            // Ensure middle panel has a selection when possible
            if (i === this.PANEL.MIDDLE && this.state.activeIndex[i] === -1 && elements.length > 0) {
                this.state.activeIndex[i] = 0;
            }
        }
    }

    restoreActivePanelFocus() {
        const rightPanelHasContent = this.getPanelElements(this.PANEL.RIGHT).length > 0;

        if (rightPanelHasContent && this.state.activePanel === this.PANEL.RIGHT) {
            this.changeActivePanel(this.PANEL.RIGHT);
        } else {
            this.changeActivePanel(this.PANEL.MIDDLE);
        }
    }

    syncSelectedContent() {
        if (this.state.activePanel === this.PANEL.MIDDLE &&
            this.state.activeIndex[this.PANEL.MIDDLE] === 0) {
            this.syncRightPanelWithMiddlePanelSelection();
        }
    }

    syncRightPanelWithMiddlePanelSelection() {
        if (this.state.activePanel !== this.PANEL.MIDDLE) return;

        const selectedElement = this.getSelectedElement();
        if (!selectedElement) return;

        const item = selectedElement.dataset.item;
        this.populateRightPanel(item).then(() => {
            const rightElements = this.getPanelElements(this.PANEL.RIGHT);
            if (rightElements.length > 0) {
                this.state.activeIndex[this.PANEL.RIGHT] = 0;
                this.clearPanelSelection(this.PANEL.RIGHT);
                this.setItemSelected(rightElements[0], true);
                this.updatePanelElements(this.PANEL.RIGHT);
            }
        });
    }

    changeActivePanel(newPanel) {
        const targetPanel = this.determineTargetPanel(newPanel);
        this.state.activePanel = targetPanel;
        this.ensureSelectionInPanel(targetPanel);
    }

    determineTargetPanel(requestedPanel) {
        // At root, only middle panel is available
        if (requestedPanel === this.PANEL.LEFT && this.state.currentPath.length === 0) {
            return this.PANEL.MIDDLE;
        }

        // Default to middle panel for invalid requests
        if (requestedPanel !== this.PANEL.MIDDLE && requestedPanel !== this.PANEL.RIGHT) {
            return this.PANEL.MIDDLE;
        }

        // Can't focus empty right panel
        if (requestedPanel === this.PANEL.RIGHT &&
            this.getPanelElements(this.PANEL.RIGHT).length === 0) {
            return this.PANEL.MIDDLE;
        }

        return requestedPanel;
    }

    ensureSelectionInPanel(panelIndex) {
        const elements = this.getPanelElements(panelIndex);
        if (elements.length === 0) return;

        if (this.state.activeIndex[panelIndex] === -1) {
            this.state.activeIndex[panelIndex] = 0;
        }

        this.moveSelection(0);
    }

    moveSelection(direction) {
        // Handle special case for left panel at root
        if (this.state.activePanel === this.PANEL.LEFT && this.state.currentPath.length === 0) {
            this.changeActivePanel(this.PANEL.MIDDLE);
            return;
        }

        const elements = this.getPanelElements(this.state.activePanel);
        if (elements.length === 0) return;

        // Clear previous selection
        this.clearPanelSelection(this.state.activePanel);

        // Update index with bounds checking
        this.state.activeIndex[this.state.activePanel] = this.calculateNewIndex(
            this.state.activeIndex[this.state.activePanel],
            direction,
            elements.length
        );

        // Apply selection
        const element = elements[this.state.activeIndex[this.state.activePanel]];
        if (element) {
            this.setItemSelected(element, true);
            element.scrollIntoView({ block: 'nearest' });

            if (this.state.activePanel === this.PANEL.MIDDLE) {
                this.highlightSelected(element, this.getPanelElement(this.state.activePanel));
            }
        }
    }

    calculateNewIndex(currentIndex, direction, maxLength) {
        const newIndex = currentIndex + direction;
        return Math.max(0, Math.min(newIndex, maxLength - 1));
    }

    /**
     * Event handlers
     */
    handleKeyDown(event) {
        // Skip keyboard handling when settings modal is open
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && !settingsModal.classList.contains('hidden')) {
            return; // Exit early if settings modal is open
        }

        // Skip keyboard handling when chat interface is active
        const chatScreen = document.getElementById('llm-chat-screen');
        if (chatScreen && chatScreen.style.display !== 'none' && !chatScreen.classList.contains('hidden')) {
            return; // Exit early if chat interface is active
        }

        // Handle search shortcut (Ctrl+F)
        if (event.ctrlKey && event.key === 'f') {
            this.toggleSearch();
            event.preventDefault();
            return;
        }

        // If search is active and Escape is pressed, clear search
        if (this.state.searchActive && event.key === 'Escape') {
            this.clearSearch();
            event.preventDefault();
            return;
        }

        // Now handle keyboard navigation as usual
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
                this.moveSelection(event.key === 'ArrowUp' ? -1 : 1);
                this.syncRightPanelWithMiddlePanelSelection();
                event.preventDefault();
                break;

            case 'ArrowLeft':
                this.handleLeftArrowKey();
                event.preventDefault();
                break;

            case 'ArrowRight':
                this.handleRightArrowKey();
                event.preventDefault();
                break;

            case 'Enter':
                this.handleEnterKey();
                event.preventDefault();
                break;

            case ' ':
                this.handleSpaceKey();
                event.preventDefault();
                break;
        }
    }

    handleLeftArrowKey() {
        if (this.state.activePanel === this.PANEL.MIDDLE && this.state.currentPath.length > 0) {
            this.navigateUp();
        } else if (this.state.activePanel === this.PANEL.RIGHT) {
            this.changeActivePanel(this.PANEL.MIDDLE);
        }
    }

    handleRightArrowKey() {
        if (this.state.activePanel !== this.PANEL.MIDDLE) return;

        const selectedElement = this.getSelectedElement();
        if (!selectedElement) return;

        if (selectedElement.classList.contains('folder')) {
            this.navigateInto(selectedElement.dataset.item);
            this.changeActivePanel(this.PANEL.MIDDLE);
        } else if (selectedElement.classList.contains('file')) {
            this.populateRightPanel(selectedElement.dataset.item);
            if (this.getPanelElements(this.PANEL.RIGHT).length > 0) {
                this.changeActivePanel(this.PANEL.RIGHT);
            }
        }
    }

    handleEnterKey() {
        const selectedElement = this.getSelectedElement();
        if (!selectedElement) return;

        if (this.state.activePanel === this.PANEL.MIDDLE) {
            if (selectedElement.classList.contains('folder')) {
                this.navigateInto(selectedElement.dataset.item);
            } else if (selectedElement.classList.contains('file')) {
                this.populateRightPanel(selectedElement.dataset.item);
            }
        } else if (this.state.activePanel === this.PANEL.RIGHT) {
            const item = selectedElement.dataset.item;
            this.toggleSelection(item, selectedElement);
        }
    }

    handleSpaceKey() {
        const selectedElement = this.getSelectedElement();
        if (!selectedElement) return;

        this.handleSelectionLogic(selectedElement);
    }

    handlePanelClick(event, panelIndex) {
        if (panelIndex === this.PANEL.LEFT && this.state.currentPath.length === 0) return;

        const element = event.target.closest(".folder, .file");
        if (!element) return;

        this.applyKeyboardSelectionToElement(panelIndex, element);

        if (panelIndex === this.PANEL.LEFT) {
            this.handleLeftPanelItemClick(element);
        } else if (panelIndex === this.PANEL.MIDDLE) {
            this.handleMiddlePanelItemClick(element);
        }
    }

    applyKeyboardSelectionToElement(panelIndex, element) {
        const clickedIndex = Array.from(this.getPanelElements(panelIndex)).indexOf(element);
        if (clickedIndex === -1) return;

        this.state.activeIndex[panelIndex] = clickedIndex;
        this.clearPanelSelection(panelIndex);
        this.setItemSelected(element, true);

        if (panelIndex === this.PANEL.MIDDLE) {
            this.changeActivePanel(this.PANEL.MIDDLE);
        }
    }

    handleLeftPanelItemClick(element) {
        const item = element.dataset.item;
        const level = parseInt(element.dataset.level, 10) || 0;

        let newPath;
        if (this.state.currentPath.length === 0) {
            newPath = [item];
        } else {
            newPath = this.state.currentPath.slice(0, level);
            newPath.push(item);
        }

        this.navigate(newPath);
    }

    handleMiddlePanelItemClick(element) {
        const item = element.dataset.item;

        if (element.classList.contains("folder")) {
            this.navigateInto(item);
        } else if (element.classList.contains("file")) {
            this.highlightSelected(element, this.elements.middlePanel);
            this.populateRightPanel(item);
        }
    }

    handleRightPanelClick(event) {
        const element = event.target.closest("li");
        if (!element) return;

        this.changeActivePanel(this.PANEL.RIGHT);

        if (element.classList.contains('folder') || element.classList.contains('file')) {
            this.handleRightPanelItemClick(element);
        } else {
            const clickedIndex = Array.from(this.getPanelElements(this.PANEL.RIGHT)).indexOf(element);
            if (clickedIndex !== -1) {
                this.state.activeIndex[this.PANEL.RIGHT] = clickedIndex;
                this.moveSelection(0);
                this.toggleItemSelection(element.dataset.item, element);
            }
        }
    }

    handleRightPanelItemClick(element) {
        const fullPath = element.dataset.item;

        if (fullPath && this.state.selectedFile) {
            if (element.classList.contains('folder')) {
                this.navigateInto(this.state.selectedFile);
                this.navigateInto(fullPath);
            } else if (element.classList.contains('file')) {
                this.navigateInto(this.state.selectedFile);
                this.state.selectedFile = fullPath;
                this.populateRightPanel(fullPath);
            }
        }
    }

    /**
     * Selection management
     */
    toggleSelection(item, element) {
        if (!element) return;

        if (this.state.selectedItems.has(item)) {
            this.state.selectedItems.delete(item);
            element.classList.remove('item-selected');
        } else {
            this.state.selectedItems.add(item);
            element.classList.add('item-selected');
        }

        this.updateSelectionStatistics();
    }

    toggleFolderSelection(folderPath, element) {
        const currentNode = this.getNodeAtCurrentPath()?.children?.[folderPath];
        if (!currentNode) return;

        // Determine if we're selecting or deselecting
        const shouldSelect = !this.state.middlePanelSelectedItems.has(folderPath);

        // Update state for this folder
        this.state.folderSelectionState[folderPath] = shouldSelect ?
            this.SELECTION.FULL : this.SELECTION.NONE;

        if (shouldSelect) {
            this.state.middlePanelSelectedItems.add(folderPath);
        } else {
            this.state.middlePanelSelectedItems.delete(folderPath);
        }

        // Recursively update all children
        this.updateSelectionForAllChildren(currentNode, shouldSelect);

        // Update ancestor folders
        this.updateAncestorFolderStates(folderPath);

        // Refresh UI
        this.updateVisibleElements();
        this.updateSelectionStatistics();
    }

    toggleMiddlePanelItemSelection(itemPath, element) {
        const isSelected = this.state.middlePanelSelectedItems.has(itemPath);

        // Toggle selection state
        if (isSelected) {
            this.state.middlePanelSelectedItems.delete(itemPath);
            element.classList.remove('item-selected');
        } else {
            this.state.middlePanelSelectedItems.add(itemPath);
            element.classList.add('item-selected');
        }

        // Update ancestor folders and UI
        this.updateAncestorFolderStates(itemPath);
        this.updateVisibleElements();
        this.updateSelectionStatistics();
    }

    toggleItemSelection(itemPath, element) {
        const isSelected = this.state.rightPanelSelectedItems.has(itemPath);

        // Toggle selection state
        if (isSelected) {
            this.state.rightPanelSelectedItems.delete(itemPath);
            element.classList.remove('item-selected');
        } else {
            this.state.rightPanelSelectedItems.add(itemPath);
            element.classList.add('item-selected');
        }

        // Update UI
        this.updateAncestorFolderStates(itemPath);
        this.updateVisibleElements();
        this.updateSelectionStatistics();
    }

    updateSelectionForAllChildren(node, shouldSelect) {
        if (!node || !node.children) return;

        Object.keys(node.children).forEach(childPath => {
            const childNode = node.children[childPath];
            const hasSubfolders = this.hasChildren(childNode);

            // Update selection state for this child
            if (shouldSelect) {
                this.state.middlePanelSelectedItems.add(childPath);
                if (hasSubfolders) {
                    this.state.folderSelectionState[childPath] = this.SELECTION.FULL;
                }
            } else {
                this.state.middlePanelSelectedItems.delete(childPath);
                if (hasSubfolders) {
                    this.state.folderSelectionState[childPath] = this.SELECTION.NONE;
                }
            }

            // Recurse for subfolders
            if (hasSubfolders) {
                this.updateSelectionForAllChildren(childNode, shouldSelect);
            }
        });
    }

    updateAncestorFolderStates(path) {
        const parts = path.split('/');

        // Build all ancestor paths and recalculate their states
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('/');
            this.calculateFolderState(parentPath);
        }

        // Refresh UI
        this.updateVisibleElements();
    }

    calculateFolderState(folderPath) {
        const folderNode = this.getPathNode(folderPath);
        if (!folderNode || !this.hasChildren(folderNode)) {
            this.state.folderSelectionState[folderPath] = this.SELECTION.NONE;
            return;
        }

        let allSelected = true;
        let anySelected = false;

        // Check all children
        Object.keys(folderNode.children).forEach(childPath => {
            if (this.hasChildren(folderNode.children[childPath])) {
                // Child is a folder - check its state
                const childState = this.state.folderSelectionState[childPath] || this.SELECTION.NONE;

                if (childState === this.SELECTION.FULL || childState === this.SELECTION.PARTIAL) {
                    anySelected = true;
                }
                if (childState !== this.SELECTION.FULL) {
                    allSelected = false;
                }
            } else if (this.state.middlePanelSelectedItems.has(childPath)) {
                // Child is a selected file
                anySelected = true;
            } else {
                // Child is an unselected file
                allSelected = false;
            }
        });

        // Set the appropriate state
        this.state.folderSelectionState[folderPath] = allSelected
            ? this.SELECTION.FULL
            : anySelected
                ? this.SELECTION.PARTIAL
                : this.SELECTION.NONE;
    }

    /**
     * UI update methods
     */
    updateVisibleElements() {
        [this.PANEL.LEFT, this.PANEL.MIDDLE, this.PANEL.RIGHT].forEach(panel => {
            this.updatePanelElements(panel);
        });
    }

    updatePanelElements(panelIndex) {
        const panel = this.getPanelElement(panelIndex);

        // Update folders with selection state
        panel.querySelectorAll('.folder').forEach(element => {
            const folderPath = element.dataset.item;
            const selectionState = this.state.folderSelectionState[folderPath] || this.SELECTION.NONE;
            this.updateElementSelectionClasses(element, selectionState);
        });

        // Update files with selection state
        panel.querySelectorAll('.file').forEach(element => {
            const filePath = element.dataset.item;
            const isSelected = this.state.middlePanelSelectedItems.has(filePath);
            element.classList.toggle('item-selected', isSelected);
        });
    }

    updateElementSelectionClasses(element, selectionState) {
        element.classList.remove('item-selected', 'partially-selected');

        if (selectionState === this.SELECTION.FULL) {
            element.classList.add('item-selected');
        } else if (selectionState === this.SELECTION.PARTIAL) {
            element.classList.add('partially-selected');
        }
    }

    /**
     * Utility methods
     */
    setItemSelected(element, selected = true) {
        if (element?.classList) {
            element.classList.toggle('selected', selected);
        }
    }

    clearPanelSelection(panelIndex) {
        this.getPanelElements(panelIndex).forEach(el => this.setItemSelected(el, false));
    }

    highlightSelected(element, panel) {
        panel.querySelectorAll(".selected").forEach(el => this.setItemSelected(el, false));
        this.setItemSelected(element, true);
    }

    getPanelElement(panelIndex) {
        return [
            this.elements.leftPanel,
            this.elements.middlePanel,
            this.elements.rightPanel
        ][panelIndex];
    }

    getPanelElements(panelIndex) {
        const panel = this.getPanelElement(panelIndex);
        return panelIndex === this.PANEL.RIGHT
            ? Array.from(panel.querySelectorAll('li.folder, li.file, li'))
            : Array.from(panel.querySelectorAll('.folder, .file'));
    }

    getSelectedElement() {
        const elements = this.getPanelElements(this.state.activePanel);
        const index = this.state.activeIndex[this.state.activePanel];

        return (index >= 0 && index < elements.length) ? elements[index] : null;
    }

    getNodeAtCurrentPath() {
        return this.getNodeAtPath(this.state.currentPath);
    }

    getParentPath() {
        return this.state.currentPath.length > 0 ?
            this.state.currentPath.slice(0, -1) : [];
    }

    getNodeAtPath(path) {
        let node = this.state.contentTree;

        for (const segment of path) {
            if (!node?.children?.[segment]) {
                return null;
            }
            node = node.children[segment];
        }

        return node;
    }

    getPathNode(path) {
        if (!path) return this.state.contentTree;

        let currentPath = '';
        let node = this.state.contentTree;

        for (const part of path.split('/')) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            if (!node?.children?.[currentPath]) {
                return null;
            }

            node = node.children[currentPath];
        }

        return node;
    }

    hasChildren(node) {
        return node?.children && Object.keys(node.children).length > 0;
    }

    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    }

    /**
     * Get all selected files with proper paths - now we only select files, not individual card sections
     */
    getAllSelectedFiles() {
        const results = [];

        const processNode = (node, path = "") => {
            if (!node?.children) return;

            Object.entries(node.children).forEach(([name, childNode]) => {
                // The name itself is already the full path from the root
                const fullPath = name;

                if (this.hasChildren(childNode)) {
                    // Process folder
                    const folderState = this.state.folderSelectionState[fullPath];

                    if (folderState === this.SELECTION.FULL) {
                        // Pass the folder's own path directly - don't concatenate
                        this.collectAllFiles(childNode, fullPath, results);
                    } else if (folderState === this.SELECTION.PARTIAL) {
                        processNode.call(this, childNode);
                    }
                } else if (this.state.middlePanelSelectedItems.has(fullPath)) {
                    // It's a selected file - use path directly
                    results.push(fullPath);
                }
            });
        };

        // Start recursive processing at root
        processNode.call(this, this.state.contentTree);

        return results;
    }

    /**
     * Helper to collect all files in a folder
     */
    collectAllFiles(node, folderPath, results) {
        if (!node?.children) return;

        Object.entries(node.children).forEach(([childPath, childNode]) => {
            // childPath is already the full path - don't concatenate with folderPath
            if (this.hasChildren(childNode)) {
                this.collectAllFiles(childNode, childPath, results);
            } else {
                results.push(childPath);
            }
        });
    }

    /**
     * Update the selection statistics display
     */
    updateSelectionStatistics() {
        const selectedFiles = this.getAllSelectedFiles();

        if (selectedFiles.length === 0) {
            this.elements.statsPanel.innerHTML = "No items selected";
            this.elements.statsPanel.classList.remove("has-selections");
            return;
        }

        // Count unique folders
        const folders = new Set();
        selectedFiles.forEach(filePath => {
            const lastSlashIndex = filePath.lastIndexOf('/');
            if (lastSlashIndex > 0) {
                // Extract folder path (everything before the last slash)
                const folderPath = filePath.substring(0, lastSlashIndex);
                folders.add(folderPath);
            }
        });

        // Update the display
        const fileText = selectedFiles.length === 1 ? "file" : "files";
        const folderText = folders.size === 1 ? "folder" : "folders";

        this.elements.statsPanel.innerHTML =
            `Selected <strong>${selectedFiles.length}</strong> ${fileText}` +
            (folders.size > 0 ? ` from <strong>${folders.size}</strong> ${folderText}` : "");

        this.elements.statsPanel.classList.add("has-selections");
    }

    loadAllFiles(files) {
        // Ensure we have proper file access
        if (!this.state.fileContents) {
            this.state.fileContents = {};
        }

        // Ensure all selected files have their content loaded
        const contentPromises = files.map(file => {
            if (!this.state.fileContents[file]) {
                return this.loadFileContent(file)
                    .then(content => {
                        if (content) {
                            this.state.fileContents[file] = content;
                        }
                    })
                    .catch(error => {
                        console.error(`Failed to load content for ${file}:`, error);
                    });
            }
            return Promise.resolve();
        });

        return Promise.all(contentPromises);
    }

    /**
     * Load file content from the content directory 
     * @param {string} file - File path
     * @returns {Promise<string>} - Promise that resolves to file content
     */
    loadFileContent(file) {
        const pathParts = file.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `content/${pathParts.slice(0, -1).map(p => {
            const parts = p.split('/');
            return parts[parts.length - 1];
        }).join("/")}/${fileName}`;

        return fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${filePath}: ${response.status}`);
                }
                return response.text();
            });
    }

    /**
     * Toggle search field visibility
     */
    toggleSearch() {
        const searchInput = this.elements.searchInput;
        const isHidden = searchInput.classList.contains('hidden');
        const searchContainer = searchInput.closest('.search-container');

        if (isHidden) {
            searchInput.classList.remove('hidden');
            this.elements.clearSearchButton.classList.remove('hidden');
            this.elements.selectAllButton.classList.remove('hidden');
            searchContainer.classList.add('active'); // Add active class to container
            searchInput.focus();
        } else {
            this.clearSearch();
        }
    }

    /**
     * Clear search and restore normal view
     */
    clearSearch() {
        const searchInput = this.elements.searchInput;
        const searchContainer = searchInput.closest('.search-container');
        
        searchInput.value = '';
        searchInput.classList.add('hidden');
        this.elements.clearSearchButton.classList.add('hidden');
        this.elements.selectAllButton.classList.add('hidden');
        searchContainer.classList.remove('active'); // Remove active class from container
        this.state.searchQuery = '';
        this.state.searchActive = false;

        // Restore original content if we were in search mode
        if (this.state.originalMiddlePanelContent) {
            this.elements.middlePanel.innerHTML = this.state.originalMiddlePanelContent;
            this.state.originalMiddlePanelContent = null;
            this.updateVisibleElements();
        }
    }

    /**
     * Handle search input
     */
    handleSearch() {
        const query = this.elements.searchInput.value.trim().toLowerCase();
        this.state.searchQuery = query;

        if (!query) {
            this.clearSearch();
            return;
        }

        // If this is the first search in this session, store the current content
        if (!this.state.searchActive) {
            this.state.originalMiddlePanelContent = this.elements.middlePanel.innerHTML;
            this.state.searchActive = true;
        }

        // Perform the search
        this.performSearch(query);
    }

    /**
     * Perform fuzzy search on current directory contents
     */
    performSearch(query) {
        const currentNode = this.getNodeAtCurrentPath();
        if (!currentNode) return;

        // Get all files and folders at the current path
        const items = Object.keys(currentNode.children);

        // Fuzzy match items against the query
        const results = items.filter(fullPath => {
            const displayName = currentNode.children[fullPath].name.toLowerCase();
            return displayName.includes(query);
        });

        this.state.searchResults = results;

        // Display search results
        this.displaySearchResults(results, currentNode);
    }

    /**
     * Display search results in the middle panel
     */
    displaySearchResults(results, currentNode) {
        if (results.length === 0) {
            this.elements.middlePanel.innerHTML = "<div class='empty-message'>No matching files or folders</div>";
            return;
        }

        // Build the HTML for search results
        const resultsHtml = results.map(fullPath => {
            const childNode = currentNode.children[fullPath];
            const isFolder = this.hasChildren(childNode);
            const displayName = childNode.name;

            // Check if item is selected
            const isSelected = this.state.middlePanelSelectedItems.has(fullPath);
            const selectionState = isFolder ?
                (this.state.folderSelectionState[fullPath] || this.SELECTION.NONE) : undefined;

            // Prepare selection classes
            const selectionClass = isSelected ? ' item-selected' :
                (selectionState === this.SELECTION.PARTIAL ? ' partially-selected' : '');

            return `<div class="${isFolder ? "folder" : "file"}${selectionClass}" 
                data-item="${fullPath}">${displayName}</div>`;
        }).join("");

        this.elements.middlePanel.innerHTML = resultsHtml;

        // Update UI elements
        this.updateVisibleElements();
    }

    /**
     * Select all visible files in the middle panel
     * This selects only files that match the current search results
     */
    selectAllVisibleFiles() {
        if (!this.state.searchActive) return;

        const visibleFiles = this.elements.middlePanel.querySelectorAll('.file');
        visibleFiles.forEach(fileElement => {
            const filePath = fileElement.dataset.item;
            if (!this.state.middlePanelSelectedItems.has(filePath)) {
                this.state.middlePanelSelectedItems.add(filePath);
                fileElement.classList.add('item-selected');
            }
        });

        // Update selection statistics
        this.updateSelectionStatistics();
    }
}
