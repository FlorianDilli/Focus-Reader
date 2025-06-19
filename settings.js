// settings.js
// This file contains the default configuration for the QuickStream Speed Reader.
// Edit these values to change the default behavior of the application.

const APP_CONFIG = {
    // NEW: Dynamic speed based on word length
    dynamicSpeed: {
        defaultEnabled: false, // Feature is off by default
        penalty: { // Defines the "ms per character" penalty
            default: 5,
            min: 0,
            max: 20,
            step: 1
        }
    },
    wpm: {
        default: 350,
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
            bgColor: '#FFF2E0',         // Main background color of the page
            panelColor: '#ffffff',       // Background color for panels (input, settings, display window)
            primaryColor: '#898AC4',     // Accent color (buttons, progress bar, slider fill, etc.)
            textColor: '#68649e',        // Primary text color for general content
            textLightColor: '#898AC4',   // Secondary text color (subtitles, labels, less important text)
            borderColor: '#dee2e6',      // Color for borders around elements and panels
            fontColor: '#68649e'         // Default color for the text in the reading display window
        },
        dark: {
            bgColor: '#222831',         // Main background color of the page
            panelColor: '#393E46',       // Background color for panels (input, settings, display window)
            primaryColor: '#DFD0B8',     // Accent color (buttons, progress bar, slider fill, etc.)
            textColor: '#948979',        // Primary text color for general content
            textLightColor: '#adb5bd',   // Secondary text color (subtitles, labels, less important text)
            borderColor: '#495057',      // Color for borders around elements and panels
            fontColor: '#e9ecef'         // Default color for the text in the reading display window
        }
    },
    defaultTheme: 'light', // Can be 'light' or 'dark'
    settingsPanel: {
        // Set to true if you want the settings panel to be collapsed by default
        startCollapsed: true
    }
};