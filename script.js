'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Check if APP_CONFIG is loaded
    if (typeof APP_CONFIG === 'undefined') {
        console.error("Settings file (settings.js) is not loaded or APP_CONFIG is not defined.");
        alert("Error: Application configuration is missing.");
        return;
    }

    // DOM Elements
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
    const startPauseBtnInitial = document.getElementById('start-pause-btn-initial');
    const pasteBtn = document.getElementById('paste-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn'); // NEW
    // Collapsible Settings Elements
    const controlsSection = document.getElementById('controls-section');
    const collapsibleHeader = document.querySelector('.collapsible-header');

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
        timerId: null
    };

    // --- Theme Management --- NEW SECTION
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

        // Font Color Picker - Value is set by applyTheme
        fontColorPicker.value = state.fontColor;
        wordDisplay.style.color = state.fontColor;
        
        // Collapsible Settings
        if (APP_CONFIG.settingsPanel.startCollapsed) {
            controlsSection.classList.add('collapsed');
        }
    }

    // --- Event Listeners ---
    wpmSlider.addEventListener('input', (e) => { state.wpm = parseInt(e.target.value, 10); wpmValue.textContent = state.wpm; });
    chunkSlider.addEventListener('input', (e) => { state.chunkSize = parseInt(e.target.value, 10); chunkValue.textContent = state.chunkSize; });
    commaPauseSlider.addEventListener('input', (e) => { state.commaPauseMultiplier = parseFloat(e.target.value); commaPauseValue.textContent = state.commaPauseMultiplier.toFixed(1); });
    sentencePauseSlider.addEventListener('input', (e) => { state.endOfSentencePauseMultiplier = parseFloat(e.target.value); sentencePauseValue.textContent = state.endOfSentencePauseMultiplier.toFixed(1); });
    fontSizeSlider.addEventListener('input', (e) => { state.fontSize = parseInt(e.target.value, 10); fontSizeValue.textContent = state.fontSize; wordDisplay.style.fontSize = `${state.fontSize}px`; });
    fontColorPicker.addEventListener('input', (e) => { state.fontColor = e.target.value; wordDisplay.style.color = state.fontColor; });
    
    startPauseBtn.addEventListener('click', handleStartPause);
    startPauseBtnInitial.addEventListener('click', handleStartPause);
    resetBtn.addEventListener('click', resetApp);
    pasteBtn.addEventListener('click', handlePaste);
    themeToggleBtn.addEventListener('click', handleThemeToggle); // NEW
    
    collapsibleHeader.addEventListener('click', () => {
        controlsSection.classList.toggle('collapsed');
    });

    // --- Event Handlers ---
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

        // UPDATED: Reset font color to theme default on app reset
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
        
        state.currentIndex = chunkEnd;
        updateProgressBar();
        return currentChunkWords;
    }

    function calculateDelay(chunkWords) {
        const baseDelayPerWord = (60 * 1000) / state.wpm;
        const baseChunkDelay = baseDelayPerWord * chunkWords.length;
        
        let bonus = 0;

        for (const word of chunkWords) {
            if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
                bonus = baseDelayPerWord * (state.endOfSentencePauseMultiplier - 1);
                break;
            }
            if (word.endsWith(',') || word.endsWith(';') || word.endsWith(':')) {
                bonus = baseDelayPerWord * (state.commaPauseMultiplier - 1);
            }
        }
        
        return baseChunkDelay + bonus;
    }

    function updateProgressBar() {
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