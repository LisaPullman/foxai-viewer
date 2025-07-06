import { MultimodalLiveClient } from './core/websocket-client.js';
import { AudioStreamer } from './audio/audio-streamer.js';
import { AudioRecorder } from './audio/audio-recorder.js';
import { CONFIG } from './config/config.js';
import { Logger } from './utils/logger.js';
import { VideoManager } from './video/video-manager.js';
import { ScreenRecorder } from './video/screen-recorder.js';
import { languages } from './language-selector.js';
import { i18n } from './i18n/i18n-manager.js';
import { mcpToolUI } from './tools/mcp-ui.js';

/**
 * @fileoverview Main entry point for the application.
 * Initializes and manages the UI, audio, video, and WebSocket interactions.
 */

// DOM Elements
const logsContainer = document.getElementById('logs-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const micButton = document.getElementById('mic-button');
const micIcon = document.getElementById('mic-icon');
const audioVisualizer = document.getElementById('audio-visualizer');
const connectButton = document.getElementById('connect-button');
const cameraButton = document.getElementById('camera-button');
const cameraIcon = document.getElementById('camera-icon');
const stopVideoButton = document.getElementById('stop-video');
const screenButton = document.getElementById('screen-button');
const screenIcon = document.getElementById('screen-icon');
const screenContainer = document.getElementById('screen-container');
const screenPreview = document.getElementById('screen-preview');
const inputAudioVisualizer = document.getElementById('input-audio-visualizer');
// API Pool configuration - hardcoded (根据您的截图确认)
const API_POOL_CONFIG = {
    apiKey: 'F435261ox',
    baseUrl: 'http://10.20200108.xyz:8000',  // 恢复完整URL
    endpoint: '/v1/chat/completions'
};

// Fallback configuration for testing (using local proxy)
const FALLBACK_CONFIG = {
    apiKey: 'test-key',
    baseUrl: window.location.origin,
    endpoint: '/v1/chat/completions'
};

// DOM Elements
const connectionModeSelect = document.getElementById('connection-mode-select');
const apiPoolInfo = document.getElementById('api-pool-info');
const websocketSettings = document.getElementById('websocket-settings');
const apiKeyInput = document.getElementById('api-key');
const voiceSelect = document.getElementById('voice-select');
const languageSelect = document.getElementById('language-select');
const uiLanguageSelect = document.getElementById('ui-language-select');
const fpsInput = document.getElementById('fps-input');
const configToggle = document.getElementById('config-toggle');
const configContainer = document.getElementById('config-container');
const systemInstructionInput = document.getElementById('system-instruction');
systemInstructionInput.value = CONFIG.SYSTEM_INSTRUCTION.TEXT;
const applyConfigButton = document.getElementById('apply-config');
const responseTypeSelect = document.getElementById('response-type-select');
const mcpToolsButton = document.getElementById('mcp-tools-btn');

// Load saved values from localStorage
const savedConnectionMode = localStorage.getItem('connection_mode') || 'api-pool';
const savedApiKey = localStorage.getItem('gemini_api_key');
const savedVoice = localStorage.getItem('gemini_voice');
const savedLanguage = localStorage.getItem('gemini_language');
const savedUILanguage = localStorage.getItem('gemini_ui_language');
const savedFPS = localStorage.getItem('video_fps');
const savedSystemInstruction = localStorage.getItem('system_instruction');

// Initialize connection mode
connectionModeSelect.value = savedConnectionMode;
if (savedApiKey && apiKeyInput) {
    apiKeyInput.value = savedApiKey;
}

// Handle connection mode change
connectionModeSelect.addEventListener('change', () => {
    const mode = connectionModeSelect.value;
    localStorage.setItem('connection_mode', mode);

    if (mode === 'api-pool') {
        apiPoolInfo.style.display = 'flex';
        websocketSettings.style.display = 'none';
        // Disable multimodal features for API pool mode
        micButton.style.opacity = '0.5';
        cameraButton.style.opacity = '0.5';
        screenButton.style.opacity = '0.5';
        micButton.title = 'Not available in API Pool mode';
        cameraButton.title = 'Not available in API Pool mode';
        screenButton.title = 'Not available in API Pool mode';
    } else {
        apiPoolInfo.style.display = 'none';
        websocketSettings.style.display = 'flex';
        // Enable multimodal features for WebSocket mode
        micButton.style.opacity = '1';
        cameraButton.style.opacity = '1';
        screenButton.style.opacity = '1';
        micButton.title = 'Microphone';
        cameraButton.title = 'Camera';
        screenButton.title = 'Screen Share';
    }
});

// Trigger initial mode setup
connectionModeSelect.dispatchEvent(new Event('change'));
if (savedVoice) {
    voiceSelect.value = savedVoice;
}

// Initialize UI language selector
i18n.initializeLanguageSelector();

// Initialize voice language selector (for Gemini API)
languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    languageSelect.appendChild(option);
});

if (savedLanguage) {
    languageSelect.value = savedLanguage;
}

// Initialize i18n and update page texts
i18n.updatePageTexts();

if (savedFPS) {
    fpsInput.value = savedFPS;
}
if (savedSystemInstruction) {
    systemInstructionInput.value = savedSystemInstruction;
    CONFIG.SYSTEM_INSTRUCTION.TEXT = savedSystemInstruction;
}

// Handle configuration panel toggle
configToggle.addEventListener('click', () => {
    configContainer.classList.toggle('active');
    configToggle.classList.toggle('active');
});

applyConfigButton.addEventListener('click', () => {
    configContainer.classList.toggle('active');
    configToggle.classList.toggle('active');
});

// Handle MCP tools button
mcpToolsButton.addEventListener('click', () => {
    mcpToolUI.toggle();
});

// State variables
let isRecording = false;
let audioStreamer = null;
let audioCtx = null;
let isConnected = false;
let audioRecorder = null;
let isVideoActive = false;
let videoManager = null;
let isScreenSharing = false;
let screenRecorder = null;
let isUsingTool = false;

// Multimodal Client
const client = new MultimodalLiveClient();

/**
 * Logs a message to the UI.
 * @param {string} message - The message to log.
 * @param {string} [type='system'] - The type of the message (system, user, ai).
 * @param {string} [translationKey=''] - Optional translation key for the message.
 */
function logMessage(message, type = 'system', translationKey = '') {
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry', type);

    const timestamp = document.createElement('span');
    timestamp.classList.add('timestamp');
    timestamp.textContent = new Date().toLocaleTimeString();
    logEntry.appendChild(timestamp);

    const emoji = document.createElement('span');
    emoji.classList.add('emoji');
    switch (type) {
        case 'system':
            emoji.textContent = '⚙️';
            break;
        case 'user':
            emoji.textContent = '🫵';
            break;
        case 'ai':
            emoji.textContent = '🤖';
            break;
    }
    logEntry.appendChild(emoji);

    const messageText = document.createElement('span');
    // Use translation if key is provided, otherwise use the message directly
    messageText.textContent = translationKey ? i18n.t(translationKey, message) : message;
    logEntry.appendChild(messageText);

    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

/**
 * Updates the microphone icon based on the recording state.
 */
function updateMicIcon() {
    micIcon.textContent = isRecording ? 'mic_off' : 'mic';
    micButton.style.backgroundColor = isRecording ? '#ea4335' : '#4285f4';
}

/**
 * Updates the audio visualizer based on the audio volume.
 * @param {number} volume - The audio volume (0.0 to 1.0).
 * @param {boolean} [isInput=false] - Whether the visualizer is for input audio.
 */
function updateAudioVisualizer(volume, isInput = false) {
    const visualizer = isInput ? inputAudioVisualizer : audioVisualizer;
    const audioBar = visualizer.querySelector('.audio-bar') || document.createElement('div');
    
    if (!visualizer.contains(audioBar)) {
        audioBar.classList.add('audio-bar');
        visualizer.appendChild(audioBar);
    }
    
    audioBar.style.width = `${volume * 100}%`;
    if (volume > 0) {
        audioBar.classList.add('active');
    } else {
        audioBar.classList.remove('active');
    }
}

/**
 * Initializes the audio context and streamer if not already initialized.
 * @returns {Promise<AudioStreamer>} The audio streamer instance.
 */
async function ensureAudioInitialized() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (!audioStreamer) {
        audioStreamer = new AudioStreamer(audioCtx);
        await audioStreamer.addWorklet('vumeter-out', 'js/audio/worklets/vol-meter.js', (ev) => {
            updateAudioVisualizer(ev.data.volume);
        });
    }
    return audioStreamer;
}

/**
 * Handles the microphone toggle. Starts or stops audio recording.
 * @returns {Promise<void>}
 */
async function handleMicToggle() {
    if (!isRecording) {
        try {
            await ensureAudioInitialized();
            audioRecorder = new AudioRecorder();
            
            const inputAnalyser = audioCtx.createAnalyser();
            inputAnalyser.fftSize = 256;
            const inputDataArray = new Uint8Array(inputAnalyser.frequencyBinCount);
            
            await audioRecorder.start((base64Data) => {
                if (isUsingTool) {
                    client.sendRealtimeInput([{
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Data,
                        interrupt: true     // Model isn't interruptable when using tools, so we do it manually
                    }]);
                } else {
                    client.sendRealtimeInput([{
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Data
                    }]);
                }
                
                inputAnalyser.getByteFrequencyData(inputDataArray);
                const inputVolume = Math.max(...inputDataArray) / 255;
                updateAudioVisualizer(inputVolume, true);
            });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(inputAnalyser);
            
            await audioStreamer.resume();
            isRecording = true;
            Logger.info('Microphone started');
            logMessage('Microphone started', 'system', 'micStarted');
            updateMicIcon();
        } catch (error) {
            Logger.error('Microphone error:', error);
            logMessage(`${i18n.t('errorPrefix')}${error.message}`, 'system');
            isRecording = false;
            updateMicIcon();
        }
    } else {
        if (audioRecorder && isRecording) {
            audioRecorder.stop();
        }
        isRecording = false;
        logMessage('Microphone stopped', 'system', 'micStopped');
        updateMicIcon();
        updateAudioVisualizer(0, true);
    }
}

/**
 * Resumes the audio context if it's suspended.
 * @returns {Promise<void>}
 */
async function resumeAudioContext() {
    if (audioCtx && audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
}

/**
 * Connects to the service based on selected mode.
 * @returns {Promise<void>}
 */
async function connectToWebsocket() {
    const connectionMode = connectionModeSelect.value;

    if (connectionMode === 'api-pool') {
        return connectToApiPool();
    } else {
        return connectToWebSocketMode();
    }
}

/**
 * Connects to API Pool using HTTP requests.
 * @returns {Promise<void>}
 */
async function connectToApiPool() {
    logMessage('Connecting to API Pool...', 'system', 'connecting');

    // Save values to localStorage
    localStorage.setItem('gemini_voice', voiceSelect.value);
    localStorage.setItem('gemini_language', languageSelect.value);
    localStorage.setItem('system_instruction', systemInstructionInput.value);

    try {
        // Test API Pool connection with timeout
        logMessage(`Testing connection to ${API_POOL_CONFIG.baseUrl}...`, 'system');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${API_POOL_CONFIG.baseUrl}/v1/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_POOL_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            logMessage(`Found ${data.data?.length || 0} models available`, 'system');

            isConnected = true;
            connectButton.textContent = i18n.t('disconnect');
            connectButton.classList.add('connected');
            messageInput.disabled = false;
            sendButton.disabled = false;
            // Disable multimodal features in API Pool mode
            micButton.disabled = true;
            cameraButton.disabled = true;
            screenButton.disabled = true;
            logMessage('✅ Connected to API Pool Successfully', 'system', 'connected');
        } else {
            const errorText = await response.text();
            throw new Error(`API Pool connection failed: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        let errorMessage = 'Unknown error';

        if (error.name === 'AbortError') {
            errorMessage = 'Connection timeout - API Pool may be unreachable from this network';
        } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error - API Pool may be on internal network or blocked by firewall';
        } else {
            errorMessage = error.message;
        }

        Logger.error('API Pool connection error:', error);
        logMessage(`❌ Connection Error: ${errorMessage}`, 'system');
        logMessage(`API Pool URL: ${API_POOL_CONFIG.baseUrl}`, 'system');
        logMessage(`API Key: ${API_POOL_CONFIG.apiKey.substring(0, 8)}...`, 'system');
        logMessage(`💡 Tip: If API Pool is on internal network, try WebSocket mode instead`, 'system');

        isConnected = false;
        connectButton.textContent = i18n.t('connect');
        connectButton.classList.remove('connected');
        messageInput.disabled = true;
        sendButton.disabled = true;
    }
}

/**
 * Connects to WebSocket server for full multimodal features.
 * @returns {Promise<void>}
 */
async function connectToWebSocketMode() {
    if (!apiKeyInput.value) {
        logMessage('Please input API Key', 'system', 'apiKeyRequired');
        return;
    }

    logMessage('Connecting to WebSocket...', 'system', 'connecting');

    // Save values to localStorage
    localStorage.setItem('gemini_api_key', apiKeyInput.value);
    localStorage.setItem('gemini_voice', voiceSelect.value);
    localStorage.setItem('gemini_language', languageSelect.value);
    localStorage.setItem('system_instruction', systemInstructionInput.value);

    const config = {
        model: CONFIG.API.MODEL_NAME,
        generationConfig: {
            responseModalities: responseTypeSelect.value,
            speechConfig: {
                languageCode: languageSelect.value,
                voiceConfig: { 
                    prebuiltVoiceConfig: { 
                        voiceName: voiceSelect.value    // You can change voice in the config.js file
                    }
                }
            },

        },
        systemInstruction: {
            parts: [{
                text: systemInstructionInput.value     // You can change system instruction in the config.js file
            }],
        }
    };  

    try {
        await client.connect(config, apiKeyInput.value);
        isConnected = true;
        await resumeAudioContext();
        connectButton.textContent = i18n.t('disconnect');
        connectButton.classList.add('connected');
        messageInput.disabled = false;
        sendButton.disabled = false;
        micButton.disabled = false;
        cameraButton.disabled = false;
        screenButton.disabled = false;
        logMessage('Connected to WebSocket Successfully', 'system', 'connected');
    } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        Logger.error('Connection error:', error);
        logMessage(`${i18n.t('connectionError')}${errorMessage}`, 'system');
        isConnected = false;
        connectButton.textContent = i18n.t('connect');
        connectButton.classList.remove('connected');
        messageInput.disabled = true;
        sendButton.disabled = true;
        micButton.disabled = true;
        cameraButton.disabled = true;
        screenButton.disabled = true;
    }
}

/**
 * Disconnects from the WebSocket server.
 */
function disconnectFromWebsocket() {
    client.disconnect();
    isConnected = false;
    if (audioStreamer) {
        audioStreamer.stop();
        if (audioRecorder) {
            audioRecorder.stop();
            audioRecorder = null;
        }
        isRecording = false;
        updateMicIcon();
    }
    connectButton.textContent = i18n.t('connect');
    connectButton.classList.remove('connected');
    messageInput.disabled = true;
    sendButton.disabled = true;
    micButton.disabled = true;
    cameraButton.disabled = true;
    screenButton.disabled = true;
    logMessage('Disconnected from server', 'system', 'disconnected');
    
    if (videoManager) {
        stopVideo();
    }
    
    if (screenRecorder) {
        stopScreenSharing();
    }
}

/**
 * Handles sending a text message.
 */
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const connectionMode = connectionModeSelect.value;

    if (connectionMode === 'api-pool') {
        await sendMessageToApiPool(message);
    } else {
        sendMessageToWebSocket(message);
    }

    messageInput.value = '';
}

/**
 * Sends message to API Pool using HTTP request.
 */
async function sendMessageToApiPool(message) {
    logMessage(message, 'user');
    logMessage('🔄 Sending to API Pool...', 'system');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`${API_POOL_CONFIG.baseUrl}${API_POOL_CONFIG.endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_POOL_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gemini-2.0-flash-exp',
                messages: [
                    {
                        role: 'system',
                        content: systemInstructionInput.value || 'You are a helpful assistant.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                stream: false,
                max_tokens: 2000,
                temperature: 0.7
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content || 'No response received';
            logMessage(aiResponse, 'ai');
        } else {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        let errorMessage = 'Unknown error';

        if (error.name === 'AbortError') {
            errorMessage = 'Request timeout - API Pool may be slow or unreachable';
        } else if (error.message.includes('fetch')) {
            errorMessage = 'Network error - Check connection to API Pool';
        } else {
            errorMessage = error.message;
        }

        Logger.error('API Pool message error:', error);
        logMessage(`❌ Error: ${errorMessage}`, 'system');
    }
}

/**
 * Sends message to WebSocket.
 */
function sendMessageToWebSocket(message) {
    logMessage(message, 'user');
    client.send({ text: message });
}

// Event Listeners
client.on('open', () => {
    logMessage('WebSocket connection opened', 'system');
});

client.on('log', (log) => {
    logMessage(`${log.type}: ${JSON.stringify(log.message)}`, 'system');
});

client.on('close', (event) => {
    logMessage(`WebSocket connection closed (code ${event.code})`, 'system');
});

client.on('audio', async (data) => {
    try {
        await resumeAudioContext();
        const streamer = await ensureAudioInitialized();
        streamer.addPCM16(new Uint8Array(data));
    } catch (error) {
        logMessage(`Error processing audio: ${error.message}`, 'system');
    }
});

client.on('content', (data) => {
    if (data.modelTurn) {
        if (data.modelTurn.parts.some(part => part.functionCall)) {
            isUsingTool = true;
            Logger.info('Model is using a tool');
        } else if (data.modelTurn.parts.some(part => part.functionResponse)) {
            isUsingTool = false;
            Logger.info('Tool usage completed');
        }

        const text = data.modelTurn.parts.map(part => part.text).join('');
        if (text) {
            logMessage(text, 'ai');
        }
    }
});

client.on('interrupted', () => {
    audioStreamer?.stop();
    isUsingTool = false;
    Logger.info('Model interrupted');
    logMessage('Model interrupted', 'system');
});

client.on('setupcomplete', () => {
    logMessage('Setup complete', 'system', 'setupComplete');
});

client.on('turncomplete', () => {
    isUsingTool = false;
    logMessage('Turn complete', 'system', 'turnComplete');
});

client.on('error', (error) => {
    if (error instanceof ApplicationError) {
        Logger.error(`Application error: ${error.message}`, error);
    } else {
        Logger.error('Unexpected error', error);
    }
    logMessage(`${i18n.t('errorPrefix')}${error.message}`, 'system');
});

client.on('message', (message) => {
    if (message.error) {
        Logger.error('Server error:', message.error);
        logMessage(`${i18n.t('serverError')}${message.error}`, 'system');
    }
});

sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
});

micButton.addEventListener('click', handleMicToggle);

connectButton.addEventListener('click', () => {
    if (isConnected) {
        disconnectFromWebsocket();
    } else {
        connectToWebsocket();
    }
});

messageInput.disabled = true;
sendButton.disabled = true;
micButton.disabled = true;
connectButton.textContent = i18n.t('connect');

/**
 * Handles the video toggle. Starts or stops video streaming.
 * @returns {Promise<void>}
 */
async function handleVideoToggle() {
    Logger.info('Video toggle clicked, current state:', { isVideoActive, isConnected });
    
    localStorage.setItem('video_fps', fpsInput.value);

    if (!isVideoActive) {
        try {
            Logger.info('Attempting to start video');
            if (!videoManager) {
                videoManager = new VideoManager();
            }
            
            await videoManager.start(fpsInput.value,(frameData) => {
                if (isConnected) {
                    client.sendRealtimeInput([frameData]);
                }
            });

            isVideoActive = true;
            cameraIcon.textContent = 'videocam_off';
            cameraButton.classList.add('active');
            Logger.info('Camera started successfully');
            logMessage('Camera started', 'system', 'cameraStarted');

        } catch (error) {
            Logger.error('Camera error:', error);
            logMessage(`${i18n.t('errorPrefix')}${error.message}`, 'system');
            isVideoActive = false;
            videoManager = null;
            cameraIcon.textContent = 'videocam';
            cameraButton.classList.remove('active');
        }
    } else {
        Logger.info('Stopping video');
        stopVideo();
    }
}

/**
 * Stops the video streaming.
 */
function stopVideo() {
    if (videoManager) {
        videoManager.stop();
        videoManager = null;
    }
    isVideoActive = false;
    cameraIcon.textContent = 'videocam';
    cameraButton.classList.remove('active');
    logMessage('Camera stopped', 'system', 'cameraStopped');
}

cameraButton.addEventListener('click', handleVideoToggle);
stopVideoButton.addEventListener('click', stopVideo);

cameraButton.disabled = true;

/**
 * Handles the screen share toggle. Starts or stops screen sharing.
 * @returns {Promise<void>}
 */
async function handleScreenShare() {
    if (!isScreenSharing) {
        try {
            screenContainer.style.display = 'block';
            
            screenRecorder = new ScreenRecorder();
            await screenRecorder.start(screenPreview, (frameData) => {
                if (isConnected) {
                    client.sendRealtimeInput([{
                        mimeType: "image/jpeg",
                        data: frameData
                    }]);
                }
            });

            isScreenSharing = true;
            screenIcon.textContent = 'stop_screen_share';
            screenButton.classList.add('active');
            Logger.info('Screen sharing started');
            logMessage('Screen sharing started', 'system', 'screenShareStarted');

        } catch (error) {
            Logger.error('Screen sharing error:', error);
            logMessage(`${i18n.t('errorPrefix')}${error.message}`, 'system');
            isScreenSharing = false;
            screenIcon.textContent = 'screen_share';
            screenButton.classList.remove('active');
            screenContainer.style.display = 'none';
        }
    } else {
        stopScreenSharing();
    }
}

/**
 * Stops the screen sharing.
 */
function stopScreenSharing() {
    if (screenRecorder) {
        screenRecorder.stop();
        screenRecorder = null;
    }
    isScreenSharing = false;
    screenIcon.textContent = 'screen_share';
    screenButton.classList.remove('active');
    screenContainer.style.display = 'none';
    logMessage('Screen sharing stopped', 'system', 'screenShareStopped');
}

screenButton.addEventListener('click', handleScreenShare);
screenButton.disabled = true;
