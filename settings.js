// settings.js
// This file contains the default configuration for the QuickStream Speed Reader.
// Edit these values to change the default behavior of the application.

const APP_CONFIG = {
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
        min: 16,
        max: 80,
        step: 1
    },
    // NEW: Centralized color configuration for themes
    colors: {
        light: {
            bgColor: '#fdf6e9',
            panelColor: '#fffcf5',
            primaryColor: '#ff6f00',
            textColor: '#1c1c1c',
            textLightColor: '#595959',
            borderColor: '#1c1c1c',
            // Default color for the reader text, can be overridden by user
            fontColor: '#1c1c1c'
        },
        dark: {
            bgColor: '#1a1a1a',
            panelColor: '#2a2a2a',
            primaryColor: '#ff8c00', // A slightly brighter orange for dark bg
            textColor: '#f0f0f0',
            textLightColor: '#a0a0a0',
            borderColor: '#f0f0f0',
            fontColor: '#f0f0f0'
        }
    },
    defaultTheme: 'light', // Can be 'light' or 'dark'
    settingsPanel: {
        // Set to true if you want the settings panel to be collapsed by default
        startCollapsed: true 
    }
};