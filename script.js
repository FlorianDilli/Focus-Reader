'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Check if APP_CONFIG is loaded
    if (typeof APP_CONFIG === 'undefined') {
        console.error("Settings file (settings.js) is not loaded or APP_CONFIG is not defined.");
        alert("Error: Application configuration is missing.");
        return;
    }

    // DOM Elements
    const body = document.body;
    const textInput = document.getElementById('text-input');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const wpmSlider = document.getElementById('wpm-slider');
    const wpmValue = document.getElementById('wpm-value');
    const chunkSlider = document.getElementById('chunk-slider');
    const chunkValue = document.getElementById('chunk-value');
    const commaPauseSlider = document.getElementById('comma-pause-slider');
    const commaPauseValue = document.getElementById('comma-pause-value');
    const sentencePauseSlider = document.getElementById('sentence-pause-slider');
    const sentencePauseValue = document.getElementById('sentence-pause-value');
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeValue = document.getElementById('font-size-value');
    const fontColorPicker = document.getElementById('font-color-picker');
    const wordDisplay = document.getElementById('word-display');
    const inputSection = document.getElementById('input-section');
    const readerSection = document.getElementById('reader-section');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.querySelector('.progress-bar-container');
    const startPauseBtnInitial = document.getElementById('start-pause-btn-initial');
    const pasteBtn = document.getElementById('paste-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const focusBtn = document.getElementById('focus-btn');
    // Collapsible Settings Elements
    const dynamicSpeedToggle = document.getElementById('dynamic-speed-toggle');
    const dynamicSpeedSlider = document.getElementById('dynamic-speed-slider');
    const dynamicSpeedValue = document.getElementById('dynamic-speed-value');
    const dynamicSpeedSliderGroup = document.getElementById('dynamic-speed-slider-group');
    const controlsSection = document.getElementById('controls-section');
    const collapsibleHeader = document.querySelector('.collapsible-header');
    // WPM Drag Indicator elements
    const wpmDragIndicator = document.getElementById('wpm-drag-indicator');
    const wpmDragValue = document.getElementById('wpm-drag-value');
    const wpmDragBar = document.getElementById('wpm-drag-bar');
    // NEW: Get all sliders for fill effect
    const sliders = document.querySelectorAll('input[type="range"]');
    // NEW: Get settings overlay
    const settingsOverlay = document.getElementById('settings-overlay');


    // Application State (initialized from APP_CONFIG)
    const state = {
        words: [],
        currentIndex: 0,
        wpm: APP_CONFIG.wpm.default,
        chunkSize: APP_CONFIG.chunkSize.default,
        commaPauseMultiplier: APP_CONFIG.commaPauseMultiplier.default,
        endOfSentencePauseMultiplier: APP_CONFIG.endOfSentencePauseMultiplier.default,
        fontSize: APP_CONFIG.fontSize.default,
        fontColor: '', // Will be set by theme
        theme: '', // Will be set on load
        isRunning: false,
        isPaused: false,
        timerId: null,
        isFocusMode: false,
        idleTimer: null,
        dynamicSpeedEnabled: APP_CONFIG.dynamicSpeed.defaultEnabled,
        dynamicSpeedPenalty: APP_CONFIG.dynamicSpeed.penalty.default,
    };
    
    // State for WPM gestures
    let isDraggingWPM = false;
    let wpmDragStartY = 0;
    let wpmDragStartWPM = 0;
    const WPM_DRAG_SENSITIVITY = 2; // Higher value = less sensitive drag
    let wpmIndicatorTimeoutId = null; 
    let wpmScrollAccumulator = 0;

    // --- NEW: Helper function for slider track fill ---
    function updateSliderFill(slider) {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const value = parseFloat(slider.value);
        const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;
        slider.style.setProperty('--slider-progress', `${percentage}%`);
    }

    // --- Theme Management ---
    function applyTheme(themeName) {
        const theme = APP_CONFIG.colors[themeName];
        if (!theme) {
            console.error(`Theme "${themeName}" not found in APP_CONFIG.`);
            return;
        }

        // Update CSS variables
        const root = document.documentElement;
        root.style.setProperty('--bg-color', theme.bgColor);
        root.style.setProperty('--panel-color', theme.panelColor);
        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--text-light-color', theme.textLightColor);
        root.style.setProperty('--border-color', theme.borderColor);

        // Update state and UI elements for theme-dependent values
        state.fontColor = theme.fontColor;
        fontColorPicker.value = theme.fontColor;
        wordDisplay.style.color = theme.fontColor;
        
        // Update toggle button text
        themeToggleBtn.textContent = themeName === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }

    function handleThemeToggle() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('quickstream-theme', state.theme);
        applyTheme(state.theme);
    }
    
    // --- Initialization ---
    function initializeUI() {
        // Adjust default font size for mobile using config
        if (window.innerWidth <= 600) {
            state.fontSize = APP_CONFIG.fontSize.mobileDefault;
        }

        // WPM Slider
        wpmSlider.min = APP_CONFIG.wpm.min;
        wpmSlider.max = APP_CONFIG.wpm.max;
        wpmSlider.step = APP_CONFIG.wpm.step;
        wpmSlider.value = state.wpm;
        wpmValue.textContent = state.wpm;

        // Chunk Slider
        chunkSlider.min = APP_CONFIG.chunkSize.min;
        chunkSlider.max = APP_CONFIG.chunkSize.max;
        chunkSlider.step = APP_CONFIG.chunkSize.step;
        chunkSlider.value = state.chunkSize;
        chunkValue.textContent = state.chunkSize;

        // Comma Pause Slider
        commaPauseSlider.min = APP_CONFIG.commaPauseMultiplier.min;
        commaPauseSlider.max = APP_CONFIG.commaPauseMultiplier.max;
        commaPauseSlider.step = APP_CONFIG.commaPauseMultiplier.step;
        commaPauseSlider.value = state.commaPauseMultiplier;
        commaPauseValue.textContent = state.commaPauseMultiplier.toFixed(1);

        // Sentence Pause Slider
        sentencePauseSlider.min = APP_CONFIG.endOfSentencePauseMultiplier.min;
        sentencePauseSlider.max = APP_CONFIG.endOfSentencePauseMultiplier.max;
        sentencePauseSlider.step = APP_CONFIG.endOfSentencePauseMultiplier.step;
        sentencePauseSlider.value = state.endOfSentencePauseMultiplier;
        sentencePauseValue.textContent = state.endOfSentencePauseMultiplier.toFixed(1);

        // Font Size Slider
        fontSizeSlider.min = APP_CONFIG.fontSize.min;
        fontSizeSlider.max = APP_CONFIG.fontSize.max;
        fontSizeSlider.step = APP_CONFIG.fontSize.step;
        fontSizeSlider.value = state.fontSize;
        fontSizeValue.textContent = state.fontSize;
        wordDisplay.style.fontSize = `${state.fontSize}px`;

        // Dynamic Speed Toggle & Slider
        dynamicSpeedToggle.checked = state.dynamicSpeedEnabled;
        dynamicSpeedSlider.min = APP_CONFIG.dynamicSpeed.penalty.min;
        dynamicSpeedSlider.max = APP_CONFIG.dynamicSpeed.penalty.max;
        dynamicSpeedSlider.step = APP_CONFIG.dynamicSpeed.penalty.step;
        dynamicSpeedSlider.value = state.dynamicSpeedPenalty;
        dynamicSpeedValue.textContent = state.dynamicSpeedPenalty;

        // Set the initial disabled state of the penalty slider
        toggleDynamicSpeedSliderVisuals();

        // Font Color Picker - Value is set by applyTheme
        fontColorPicker.value = state.fontColor;
        wordDisplay.style.color = state.fontColor;
        
        // Collapsible Settings logic for modal popup
        if (APP_CONFIG.settingsPanel.startCollapsed) {
            controlsSection.classList.add('collapsed');
        } else {
            // If it starts open, show the overlay too
            settingsOverlay.classList.remove('hidden');
        }


        // NEW: Set initial fill for all sliders
        sliders.forEach(updateSliderFill);
    }

    // --- Event Listeners ---
    wpmSlider.addEventListener('input', (e) => { state.wpm = parseInt(e.target.value, 10); wpmValue.textContent = state.wpm; updateSliderFill(e.target); });
    chunkSlider.addEventListener('input', (e) => { state.chunkSize = parseInt(e.target.value, 10); chunkValue.textContent = state.chunkSize; handleProgressBarScrub(); updateSliderFill(e.target); });
    commaPauseSlider.addEventListener('input', (e) => { state.commaPauseMultiplier = parseFloat(e.target.value); commaPauseValue.textContent = state.commaPauseMultiplier.toFixed(1); updateSliderFill(e.target); });
    sentencePauseSlider.addEventListener('input', (e) => { state.endOfSentencePauseMultiplier = parseFloat(e.target.value); sentencePauseValue.textContent = state.endOfSentencePauseMultiplier.toFixed(1); updateSliderFill(e.target); });
    fontSizeSlider.addEventListener('input', (e) => { state.fontSize = parseInt(e.target.value, 10); fontSizeValue.textContent = state.fontSize; wordDisplay.style.fontSize = `${state.fontSize}px`; updateSliderFill(e.target); });
    fontColorPicker.addEventListener('input', (e) => { state.fontColor = e.target.value; wordDisplay.style.color = state.fontColor; });
    
    dynamicSpeedToggle.addEventListener('change', handleDynamicSpeedToggle);
    dynamicSpeedSlider.addEventListener('input', (e) => { state.dynamicSpeedPenalty = parseInt(e.target.value, 10); dynamicSpeedValue.textContent = state.dynamicSpeedPenalty; updateSliderFill(e.target); });
    
    startPauseBtn.addEventListener('click', handleStartPause);
    startPauseBtnInitial.addEventListener('click', handleStartPause);
    resetBtn.addEventListener('click', resetApp);
    pasteBtn.addEventListener('click', handlePaste);
    themeToggleBtn.addEventListener('click', handleThemeToggle);
    focusBtn.addEventListener('click', toggleFocusMode);
    document.addEventListener('keydown', handleKeydown);
    progressBarContainer.addEventListener('click', handleProgressBarScrub);
    
    collapsibleHeader.addEventListener('click', toggleSettingsPanel);
    settingsOverlay.addEventListener('click', toggleSettingsPanel);


    // --- Event Handlers ---

    // MODIFIED: Corrected animation logic for opening and closing the settings panel.
    function toggleSettingsPanel() {
        const isCollapsed = controlsSection.classList.contains('collapsed');

        if (isCollapsed) {
            // --- OPENING THE PANEL ---
            // 1. Remove 'collapsed' so the element is no longer just a static container.
            controlsSection.classList.remove('collapsed');
            // 2. Show the overlay.
            settingsOverlay.classList.remove('hidden');
            // 3. Add the 'collapsing' class to set the initial animation state (transparent).
            // This is done after removing 'collapsed' to ensure it applies to the panel state.
            controlsSection.classList.add('collapsing');

            // 4. In the next frame, remove 'collapsing' to trigger the CSS transition.
            requestAnimationFrame(() => {
                controlsSection.classList.remove('collapsing');
            });
        } else {
            // --- CLOSING THE PANEL ---
            // 1. Add 'collapsing' to trigger the fade-out animation.
            controlsSection.classList.add('collapsing');
            // 2. Hide the overlay.
            settingsOverlay.classList.add('hidden');
            
            // 3. After the animation is done, add 'collapsed' to switch it back to the
            //    static container for the button, and REMOVE 'collapsing' to reset its state.
            setTimeout(() => {
                controlsSection.classList.add('collapsed');
                controlsSection.classList.remove('collapsing'); // This is the fix.
            }, 300); // This duration must match the transition duration in style.css
        }
    }


    function handleDynamicSpeedToggle(e) {
        state.dynamicSpeedEnabled = e.target.checked;
        toggleDynamicSpeedSliderVisuals();
    }

    // Helper function to enable/disable the slider based on the toggle state
    function toggleDynamicSpeedSliderVisuals() {
        if (state.dynamicSpeedEnabled) {
            dynamicSpeedSlider.disabled = false;
            dynamicSpeedSliderGroup.classList.remove('disabled');
        } else {
            dynamicSpeedSlider.disabled = true;
            dynamicSpeedSliderGroup.classList.add('disabled');
        }
    }
    function handleStartPause() {
        if (!state.isRunning) {
            startReading();
        } else if (state.isPaused) {
            resumeReading();
        } else {
            pauseReading();
        }
    }

    async function handlePaste() {
        try {
            if (!navigator.clipboard) {
                 alert('Clipboard API not available. Please paste manually.');
                 return;
            }
            const text = await navigator.clipboard.readText();
            textInput.value = text;
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            alert('Could not paste text. Please check browser permissions or paste manually.');
        }
    }

    // Handler for clicking/scrubbing the progress bar
    function handleProgressBarScrub(e) {
        if (state.words.length === 0) return;

        if (state.isRunning && !state.isPaused) {
            pauseReading();
        }

        let percentage = 0;
        if(e) { // If called from a click event
            const rect = progressBarContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            percentage = Math.max(0, Math.min(1, clickX / rect.width));
        } else { // If called programmatically (e.g. on chunk size change)
            percentage = state.currentIndex / state.words.length;
        }
        
        const targetWordIndex = Math.floor(percentage * state.words.length);
        
        // Snap to the beginning of a chunk
        state.currentIndex = Math.floor(targetWordIndex / state.chunkSize) * state.chunkSize;

        // Manually update the display to show the new chunk
        const chunkEnd = Math.min(state.currentIndex + state.chunkSize, state.words.length);
        const currentChunkWords = state.words.slice(state.currentIndex, chunkEnd);
        
        // Handle case where we scrub to the very end
        if(currentChunkWords.length > 0) {
            wordDisplay.innerHTML = currentChunkWords.join(' ');
        } else if (state.words.length > 0) {
            // If at the end, show the last chunk
            const lastChunkIndex = Math.floor((state.words.length - 1) / state.chunkSize) * state.chunkSize;
            state.currentIndex = lastChunkIndex;
            const lastChunk = state.words.slice(lastChunkIndex, state.words.length);
            wordDisplay.innerHTML = lastChunk.join(' ');
        }
        
        updateProgressBar();
    }

    function toggleFocusMode() {
        state.isFocusMode = !state.isFocusMode;
        body.classList.toggle('focus-mode', state.isFocusMode);

        if (state.isFocusMode) {
            focusBtn.textContent = 'Exit Focus';
            resetIdleTimer();
            document.addEventListener('mousemove', resetIdleTimer);
            document.addEventListener('mousedown', resetIdleTimer);
            // Add touch listeners for WPM control
            readerSection.addEventListener('touchstart', handleWpmDragStart, { passive: false });
            readerSection.addEventListener('touchmove', handleWpmDragMove, { passive: false });
            readerSection.addEventListener('touchend', handleWpmDragEnd);
            readerSection.addEventListener('touchcancel', handleWpmDragEnd);
            // Add wheel listener for desktop WPM control
            readerSection.addEventListener('wheel', handleWpmScroll, { passive: false });
        } else {
            focusBtn.textContent = 'Focus';
            clearTimeout(state.idleTimer);
            body.classList.remove('idle-cursor');
            document.removeEventListener('mousemove', resetIdleTimer);
            document.removeEventListener('mousedown', resetIdleTimer);
            // Remove touch listeners
            readerSection.removeEventListener('touchstart', handleWpmDragStart, { passive: false });
            readerSection.removeEventListener('touchmove', handleWpmDragMove, { passive: false });
            readerSection.removeEventListener('touchend', handleWpmDragEnd);
            readerSection.removeEventListener('touchcancel', handleWpmDragEnd);
            // Remove wheel listener
            readerSection.removeEventListener('wheel', handleWpmScroll, { passive: false });
        }
    }

    function handleKeydown(e) {
        // Handle spacebar for pause/resume and Escape for focus mode
        if (e.code === 'Space' && state.isRunning) {
            e.preventDefault(); // Prevent page from scrolling
            handleStartPause();
        } else if (e.key === "Escape") {
            // Close settings panel if it's open
            if (!controlsSection.classList.contains('collapsed')) {
                toggleSettingsPanel();
            } else if (state.isFocusMode) {
                // Otherwise, exit focus mode
                toggleFocusMode();
            }
        } else if (e.key.toLowerCase() === 'f' && document.activeElement !== textInput) { // New: Toggle focus mode with 'f' key
            toggleFocusMode();
        }
    }

    function resetIdleTimer() {
        if (!state.isFocusMode) return;
        body.classList.remove('idle-cursor');
        clearTimeout(state.idleTimer);
        state.idleTimer = setTimeout(() => {
            body.classList.add('idle-cursor');
        }, 2000); // Hide cursor after 2 seconds of inactivity
    }

    // --- WPM Gesture Handlers ---

    // WPM Scroll Gesture Handler (Desktop)
    function handleWpmScroll(e) {
        // Prevent the page from actually scrolling
        e.preventDefault();

        // The value to adjust for sensitivity. Higher number = less sensitive (more scrolling needed).
        const WPM_SCROLL_THRESHOLD = 50; 
        
        if (e.deltaY === 0) return; // No vertical scroll

        // Accumulate the scroll delta from the mouse wheel event
        wpmScrollAccumulator += e.deltaY;
        
        // Check if the accumulated value has crossed the threshold for a change
        if (Math.abs(wpmScrollAccumulator) >= WPM_SCROLL_THRESHOLD) {
            // Calculate how many "steps" of change we should apply
            const stepsToChange = Math.floor(wpmScrollAccumulator / WPM_SCROLL_THRESHOLD);
            
            // The total WPM change based on steps and config
            const wpmChange = stepsToChange * APP_CONFIG.wpm.step;

            // Calculate new WPM and clamp it within the allowed range
            let newWpm = state.wpm + wpmChange;
            newWpm = Math.max(APP_CONFIG.wpm.min, Math.min(APP_CONFIG.wpm.max, newWpm));

            if (newWpm !== state.wpm) {
                state.wpm = newWpm;
                wpmSlider.value = state.wpm;
                wpmValue.textContent = state.wpm;
                updateWpmDragIndicator();
                updateSliderFill(wpmSlider); // Update slider fill on change
            }

            // Subtract the "used" amount from the accumulator, preserving any remainder
            wpmScrollAccumulator -= stepsToChange * WPM_SCROLL_THRESHOLD;
        }

        // Show the indicator and set a timer to hide it
        wpmDragIndicator.classList.add('visible');

        // Clear any existing timer to reset the hide timeout
        clearTimeout(wpmIndicatorTimeoutId);
        wpmIndicatorTimeoutId = setTimeout(() => {
            wpmDragIndicator.classList.remove('visible');
        }, 1000); // Hide after 1 second
    }

    function handleWpmDragStart(e) {
        // Check if the touch started on a button or progress bar.
        // If so, do not start the drag gesture.
        if (e.target.closest('.btn, .progress-bar-container')) {
            return;
        }

        if (e.touches.length !== 1) return;
        e.preventDefault();
    
        // Clear the timeout for the scroll indicator, as touch takes precedence
        clearTimeout(wpmIndicatorTimeoutId);

        isDraggingWPM = true;
        wpmDragStartY = e.touches[0].clientY;
        wpmDragStartWPM = state.wpm;
        
        updateWpmDragIndicator(); // Update display to current WPM
        wpmDragIndicator.classList.add('visible');
    }
    
    function handleWpmDragMove(e) {
        if (!isDraggingWPM || e.touches.length !== 1) return;
        e.preventDefault();
    
        const currentY = e.touches[0].clientY;
        const deltaY = wpmDragStartY - currentY; // Positive delta for upward drag
    
        const wpmChange = Math.round(deltaY / WPM_DRAG_SENSITIVITY);
        
        // Calculate new WPM, snap to step, and clamp within range
        let newWpm = wpmDragStartWPM + wpmChange;
        newWpm = Math.round(newWpm / APP_CONFIG.wpm.step) * APP_CONFIG.wpm.step;
        newWpm = Math.max(APP_CONFIG.wpm.min, Math.min(APP_CONFIG.wpm.max, newWpm));
    
        if (newWpm !== state.wpm) {
            state.wpm = newWpm;
            wpmSlider.value = state.wpm;
            wpmValue.textContent = state.wpm;
            updateWpmDragIndicator();
            updateSliderFill(wpmSlider); // Update slider fill on change
        }
    }
    
    function handleWpmDragEnd(e) {
        if (!isDraggingWPM) return;
        
        isDraggingWPM = false;
        wpmDragIndicator.classList.remove('visible');
    }
    
    function updateWpmDragIndicator() {
        // Update the text value
        wpmDragValue.textContent = state.wpm;
    
        // Update the progress bar height
        const minWpm = APP_CONFIG.wpm.min;
        const maxWpm = APP_CONFIG.wpm.max;
        const wpmRange = maxWpm - minWpm;
    
        // Prevent division by zero if min and max are the same
        const percentage = wpmRange > 0 ? (state.wpm - minWpm) / wpmRange : 0;
        
        wpmDragBar.style.height = `${percentage * 100}%`;
    }

    // --- Core Logic ---
    function startReading() {
        const text = textInput.value;
        if (!text.trim()) {
            alert("Please paste some text to begin.");
            return;
        }
        processText(text);
        state.isRunning = true;
        state.isPaused = false;
        inputSection.classList.add('hidden');
        readerSection.classList.remove('hidden');
        startPauseBtn.textContent = 'Pause';
        scheduleNextChunk();
    }

    function pauseReading() {
        state.isPaused = true;
        clearTimeout(state.timerId);
        startPauseBtn.textContent = 'Resume';
    }

    function resumeReading() {
        state.isPaused = false;
        startPauseBtn.textContent = 'Pause';
        scheduleNextChunk();
    }

    function resetApp() {
        state.isRunning = false;
        state.isPaused = false;
        state.currentIndex = 0;
        state.words = [];
        clearTimeout(state.timerId);
        
        if (state.isFocusMode) {
            toggleFocusMode();
        }

        const currentThemeColors = APP_CONFIG.colors[state.theme];
        state.fontColor = currentThemeColors.fontColor;
        fontColorPicker.value = state.fontColor;
        wordDisplay.style.color = state.fontColor;

        inputSection.classList.remove('hidden');
        readerSection.classList.add('hidden');
        startPauseBtn.textContent = 'Pause';
        wordDisplay.innerHTML = '';
        progressBar.style.width = '0%';
    }

    function processText(text) {
        state.words = text.trim().split(/\s+/g).filter(word => word.length > 0);
    }
    
    function scheduleNextChunk() {
        if (!state.isRunning || state.isPaused) return;

        const displayedWords = displayNextChunk();
        
        if (!displayedWords) {
            setTimeout(() => {
                wordDisplay.innerHTML = "Done!";
                resetApp();
            }, 1000);
            return;
        }

        const delay = calculateDelay(displayedWords);
        state.timerId = setTimeout(scheduleNextChunk, delay);
    }
    
    function displayNextChunk() {
        if (state.currentIndex >= state.words.length) {
            return null; // No more words
        }

        const chunkEnd = Math.min(state.currentIndex + state.chunkSize, state.words.length);
        const currentChunkWords = state.words.slice(state.currentIndex, chunkEnd);
        
        wordDisplay.innerHTML = currentChunkWords.join(' ');
        
        updateProgressBar();
        state.currentIndex = chunkEnd; // Advance index *after* updating progress bar
        return currentChunkWords;
    }

    function calculateDelay(chunkWords) {
        const baseDelayPerWord = (60 * 1000) / state.wpm;
        const baseChunkDelay = baseDelayPerWord * chunkWords.length;

        // 1. Calculate dynamic speed penalty (if enabled)
        let dynamicPenaltyTotal = 0;
        if (state.dynamicSpeedEnabled) {
            for (const word of chunkWords) {
                // Add extra milliseconds for each character in the word
                dynamicPenaltyTotal += word.length * state.dynamicSpeedPenalty;
            }
        }
        
        // 2. Calculate punctuation-based pause bonus
        let punctuationBonus = 0;
        for (const word of chunkWords) {
            if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
                punctuationBonus = baseDelayPerWord * (state.endOfSentencePauseMultiplier - 1);
                break;
            }
            if (word.endsWith(',') || word.endsWith(';') || word.endsWith(':')) {
                punctuationBonus = baseDelayPerWord * (state.commaPauseMultiplier - 1);
            }
        }
        
        return baseChunkDelay + dynamicPenaltyTotal + punctuationBonus;
    }

    function updateProgressBar() {
        // In displayNextChunk, progress is based on where we *were*.
        // In handleProgressBarScrub, it's based on where we *are*.
        const progress = (state.currentIndex / state.words.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // --- Initial Load ---
    // Load theme from localStorage or use default, then initialize the app
    const savedTheme = localStorage.getItem('quickstream-theme') || APP_CONFIG.defaultTheme;
    state.theme = savedTheme;
    applyTheme(state.theme);
    initializeUI();
});