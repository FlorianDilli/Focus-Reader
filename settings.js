// settings.js
// This file contains the default configuration for the QuickStream Speed Reader.
// Edit these values to change the default behavior of the application.

const APP_CONFIG = {
    // NEW: Dynamic speed based on word length
    dynamicSpeed: {
        defaultEnabled: true, // Feature is off by default
        penalty: { // Defines the "ms per character" penalty
            default: 12,
            min: 0,
            max: 20,
            step: 1
        }
    },
    wpm: {
        default: 470,
        min: 50,
        max: 700,
        step: 10
    },
    chunkSize: {
        default: 1,
        min: 1,
        max: 7,
        step: 1
    },
    commaPauseMultiplier: {
        default: 2.0,
        min: 1.0,
        max: 10.0,
        step: 0.1
    },
    endOfSentencePauseMultiplier: {
        default: 4.0,
        min: 1.0,
        max: 10.0,
        step: 0.1
    },
    fontSize: {
        default: 48,
        mobileDefault: 30, // Default font size for screens <= 600px wide
        min: 16,
        max: 80,
        step: 1
    },
    // MODIFIED: Centralized color configuration for a more modern theme
    colors: {
        light: {
            bgColor: '#FFF2E0',         // Page background
            panelColor: '#ffffff',       // Panel backgrounds
            primaryColor: '#898AC4',     // Accent elements (buttons, progress bar, etc.)
            textColor: '#68649e',        // Main text
            textLightColor: '#898AC4',   // Secondary text (labels, subtitles)
            borderColor: '#dee2e6',      // Element borders
            fontColor: '#68649e'         // Reader display text
        },
        dark: {
            bgColor: '#222831',         // Page background
            panelColor: '#393E46',       // Panel backgrounds
            primaryColor: '#DFD0B8',     // Accent elements (buttons, progress bar, etc.)
            textColor: '#948979',        // Main text
            textLightColor: '#adb5bd',   // Secondary text (labels, subtitles)
            borderColor: '#495057',      // Element borders
            fontColor: '#e9ecef'         // Reader display text
        }
    },
    defaultTheme: 'light', // Can be 'light' or 'dark'
    settingsPanel: {
        // Set to true if you want the settings panel to be collapsed by default
        startCollapsed: true
    }
};