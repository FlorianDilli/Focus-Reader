'use strict';
// lolsad
document.addEventListener('DOMContentLoaded', () => {
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

    // Application State
    const state = {
        words: [],
        currentIndex: 0,
        wpm: 350,
        chunkSize: 1,
        commaPauseMultiplier: 1.4,
        endOfSentencePauseMultiplier: 1.8,
        fontSize: 48,
        fontColor: '#e0e0e0',
        isNewSentence: true,
        isRunning: false,
        isPaused: false,
        timerId: null
    };

    // --- Initialization ---
    function initializeUI() {
        wpmSlider.value = state.wpm;
        wpmValue.textContent = state.wpm;
        chunkSlider.value = state.chunkSize;
        chunkValue.textContent = state.chunkSize;
        commaPauseSlider.value = state.commaPauseMultiplier;
        commaPauseValue.textContent = state.commaPauseMultiplier.toFixed(1);
        sentencePauseSlider.value = state.endOfSentencePauseMultiplier;
        sentencePauseValue.textContent = state.endOfSentencePauseMultiplier.toFixed(1);
        fontSizeSlider.value = state.fontSize;
        fontSizeValue.textContent = state.fontSize;
        wordDisplay.style.fontSize = `${state.fontSize}px`;
        fontColorPicker.value = state.fontColor;
        wordDisplay.style.color = state.fontColor;
    }

    // --- Event Listeners ---
    wpmSlider.addEventListener('input', (e) => { state.wpm = parseInt(e.target.value, 10); wpmValue.textContent = state.wpm; });
    chunkSlider.addEventListener('input', (e) => { state.chunkSize = parseInt(e.target.value, 10); chunkValue.textContent = state.chunkSize; });
    commaPauseSlider.addEventListener('input', (e) => { state.commaPauseMultiplier = parseFloat(e.target.value); commaPauseValue.textContent = state.commaPauseMultiplier.toFixed(1); });
    sentencePauseSlider.addEventListener('input', (e) => { state.endOfSentencePauseMultiplier = parseFloat(e.target.value); sentencePauseValue.textContent = state.endOfSentencePauseMultiplier.toFixed(1); });
    fontSizeSlider.addEventListener('input', (e) => { state.fontSize = parseInt(e.target.value, 10); fontSizeValue.textContent = state.fontSize; wordDisplay.style.fontSize = `${state.fontSize}px`; });
    fontColorPicker.addEventListener('input', (e) => { state.fontColor = e.target.value; wordDisplay.style.color = state.fontColor; });
    
    // Listen to both start buttons
    startPauseBtn.addEventListener('click', handleStartPause);
    startPauseBtnInitial.addEventListener('click', handleStartPause);

    resetBtn.addEventListener('click', resetApp);

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
        state.isNewSentence = true;
        clearTimeout(state.timerId);

        inputSection.classList.remove('hidden');
        readerSection.classList.add('hidden');
        // Reset button text to 'Pause' for the reader view button
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
        
        const styledWords = [];
        for (const word of currentChunkWords) {
            let currentWord = word;
            if (state.isNewSentence) {
                currentWord = `<span class="sentence-start">${word}</span>`;
                state.isNewSentence = false; // It's no longer a new sentence after the first word
            }
            styledWords.push(currentWord);

            // Check if this word ends a sentence, to prepare for the *next* word
            if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
                state.isNewSentence = true;
            }
        }
        
        wordDisplay.innerHTML = styledWords.join(' ');
        
        state.currentIndex = chunkEnd;
        updateProgressBar();
        return currentChunkWords; // Return the original words for delay calculation
    }

    function calculateDelay(chunkWords) {
        const baseDelayPerWord = (60 * 1000) / state.wpm;
        const baseChunkDelay = baseDelayPerWord * chunkWords.length;
        
        let bonus = 0;
        let sentenceEndFound = false;

        for (const word of chunkWords) {
            if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
                bonus = baseDelayPerWord * (state.endOfSentencePauseMultiplier - 1);
                sentenceEndFound = true;
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

    // Run initialization
    initializeUI();
});