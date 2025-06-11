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
    // NEW: Centralized color configuration for themes
    colors: {
        light: {
            bgColor: '#fcf7e6',
            panelColor: '#fbf3db',
            primaryColor: '#ff6f00', // Orange
            textColor: '#63533a', 
            textLightColor: '#595959',
            borderColor: '#63533a',
            // Default color for the reader text, can be overridden by user
            fontColor: '#63533a'
        },
        dark: {
            bgColor: '#2a2a2a',
            panelColor: '#1a1a1a',
            primaryColor: '#ff8c00', // A slightly brighter orange for dark bg
            textColor: '#d9d9d9',
            textLightColor: '#a0a0a0',
            borderColor: '#d9d9d9',
            fontColor: '#d9d9d9'
        }
    },
    defaultTheme: 'light', // Can be 'light' or 'dark'
    settingsPanel: {
        // Set to true if you want the settings panel to be collapsed by default
        startCollapsed: true 
    }
};