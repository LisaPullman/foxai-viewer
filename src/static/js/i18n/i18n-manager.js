/**
 * Internationalization Manager for the Gemini Playground
 * Handles language switching and text translation
 */

import { translations } from './translations.js';

export class I18nManager {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || this.detectBrowserLanguage() || 'en';
        this.translations = translations;
        this.observers = new Set();
    }

    /**
     * Get the stored language from localStorage
     * @returns {string|null} The stored language code
     */
    getStoredLanguage() {
        return localStorage.getItem('gemini_ui_language');
    }

    /**
     * Detect browser language and map to supported languages
     * @returns {string} The detected language code
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        // Map browser language to supported languages
        const supportedLanguages = ['en', 'zh', 'de', 'fr'];
        return supportedLanguages.includes(langCode) ? langCode : 'en';
    }

    /**
     * Set the current language
     * @param {string} languageCode - The language code to set
     */
    setLanguage(languageCode) {
        if (!this.translations[languageCode]) {
            console.warn(`Language ${languageCode} not supported, falling back to English`);
            languageCode = 'en';
        }

        this.currentLanguage = languageCode;
        localStorage.setItem('gemini_ui_language', languageCode);
        
        // Update the page
        this.updatePageTexts();
        
        // Notify observers
        this.notifyObservers(languageCode);
    }

    /**
     * Get the current language
     * @returns {string} The current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get a translated text
     * @param {string} key - The translation key
     * @param {string} fallback - Fallback text if translation not found
     * @returns {string} The translated text
     */
    t(key, fallback = '') {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if key not found in current language
                value = this.translations.en;
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = value[fallbackKey];
                    } else {
                        return fallback || key;
                    }
                }
                break;
            }
        }
        
        return typeof value === 'string' ? value : (fallback || key);
    }

    /**
     * Get all available languages
     * @returns {Object} Object with language codes as keys and names as values
     */
    getAvailableLanguages() {
        return this.translations[this.currentLanguage].languages;
    }

    /**
     * Update all text elements on the page
     */
    updatePageTexts() {
        // Update placeholders
        const apiKeyInput = document.getElementById('api-key');
        if (apiKeyInput) {
            apiKeyInput.placeholder = this.t('apiKeyPlaceholder');
        }

        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.placeholder = this.t('messageInput');
        }

        const systemInstruction = document.getElementById('system-instruction');
        if (systemInstruction) {
            systemInstruction.placeholder = this.t('systemInstruction');
        }

        // Update button texts
        const connectButton = document.getElementById('connect-button');
        if (connectButton && !connectButton.classList.contains('connected')) {
            connectButton.textContent = this.t('connect');
        }

        const sendButton = document.getElementById('send-button');
        if (sendButton) {
            sendButton.textContent = this.t('send');
        }

        const applyConfigButton = document.getElementById('apply-config');
        if (applyConfigButton) {
            applyConfigButton.textContent = this.t('confirm');
        }

        const stopVideoButton = document.getElementById('stop-video');
        if (stopVideoButton) {
            stopVideoButton.textContent = this.t('stopVideo');
        }

        // Update labels
        const settingLabels = document.querySelectorAll('.setting-label');
        settingLabels.forEach((label, index) => {
            switch (index) {
                case 0:
                    label.textContent = this.t('language') + ': ';
                    break;
                case 1:
                    label.textContent = this.t('sound') + ': ';
                    break;
                case 2:
                    label.textContent = this.t('responseType') + ': ';
                    break;
                case 3:
                    label.textContent = this.t('videoFPS') + ': ';
                    break;
            }
        });

        // Update FoxAI subtitle
        const foxaiSubtitle = document.querySelector('.foxai-subtitle');
        if (foxaiSubtitle) {
            foxaiSubtitle.textContent = this.t('subtitle');
        }

        // Update visualizer labels
        const visualizerLabels = document.querySelectorAll('.visualizer-container label');
        if (visualizerLabels.length >= 2) {
            visualizerLabels[0].textContent = this.t('inputAudio');
            visualizerLabels[1].textContent = this.t('outputAudio');
        }

        // Update voice options
        this.updateVoiceOptions();

        // Update response type options
        this.updateResponseTypeOptions();

        // Update FPS help text
        const fpsHelp = document.querySelector('.fps-help');
        if (fpsHelp) {
            fpsHelp.textContent = this.t('fpsHelp');
        }
    }

    /**
     * Update voice select options
     */
    updateVoiceOptions() {
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            const options = voiceSelect.querySelectorAll('option');
            options.forEach(option => {
                switch (option.value) {
                    case 'Puck':
                        option.textContent = this.t('voicePuck');
                        break;
                    case 'Charon':
                        option.textContent = this.t('voiceCharon');
                        break;
                    case 'Fenrir':
                        option.textContent = this.t('voiceFenrir');
                        break;
                    case 'Kore':
                        option.textContent = this.t('voiceKore');
                        break;
                    case 'Aoede':
                        option.textContent = this.t('voiceAoede');
                        break;
                }
            });
        }
    }

    /**
     * Update response type options
     */
    updateResponseTypeOptions() {
        const responseTypeSelect = document.getElementById('response-type-select');
        if (responseTypeSelect) {
            const options = responseTypeSelect.querySelectorAll('option');
            options.forEach(option => {
                switch (option.value) {
                    case 'text':
                        option.textContent = this.t('text');
                        break;
                    case 'audio':
                        option.textContent = this.t('audio');
                        break;
                }
            });
        }
    }

    /**
     * Add an observer for language changes
     * @param {Function} callback - Callback function to call when language changes
     */
    addObserver(callback) {
        this.observers.add(callback);
    }

    /**
     * Remove an observer
     * @param {Function} callback - Callback function to remove
     */
    removeObserver(callback) {
        this.observers.delete(callback);
    }

    /**
     * Notify all observers of language change
     * @param {string} newLanguage - The new language code
     */
    notifyObservers(newLanguage) {
        this.observers.forEach(callback => {
            try {
                callback(newLanguage);
            } catch (error) {
                console.error('Error in i18n observer:', error);
            }
        });
    }

    /**
     * Initialize the language selector
     */
    initializeLanguageSelector() {
        const languageSelect = document.getElementById('ui-language-select');
        if (!languageSelect) return;

        // Clear existing options
        languageSelect.innerHTML = '';

        // Add language options
        const languages = this.getAvailableLanguages();
        Object.entries(languages).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            if (code === this.currentLanguage) {
                option.selected = true;
            }
            languageSelect.appendChild(option);
        });

        // Add event listener for language change
        languageSelect.addEventListener('change', (event) => {
            this.setLanguage(event.target.value);
        });
    }
}

// Create global instance
export const i18n = new I18nManager();
