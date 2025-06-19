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
            bgColor: '#FFF2E0',         // Light neutral gray
            panelColor: '#ffffff',       // Pure white
            primaryColor: '#898AC4',     // A slightly softer, richer orange
            textColor: '#A2AADB',        // High-contrast dark gray
            textLightColor: '#C0C9EE',   // Softer secondary text color
            borderColor: '#dee2e6',      // Light gray for borders
            fontColor: '#212529'         // Default font color matches text
        },
        dark: {
            bgColor: '#121212',         // True dark background
            panelColor: '#1e1e1e',       // Off-black for panels
            primaryColor: '#f39c12',     // A brighter, more vibrant orange
            textColor: '#e9ecef',        // Light, easy-to-read off-white
            textLightColor: '#adb5bd',   // Lighter gray for secondary text
            borderColor: '#495057',      // Mid-gray for borders
            fontColor: '#e9ecef'
        }
    },
    defaultTheme: 'light', // Can be 'light' or 'dark'
    settingsPanel: {
        // Set to true if you want the settings panel to be collapsed by default
        startCollapsed: true
    }
};