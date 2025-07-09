/**
 * MCP Tool Management UI
 * Provides a user interface for managing MCP tool configurations
 */

import { mcpConfig } from './mcp-config.js';
import { Logger } from '../utils/logger.js';

export class MCPToolUI {
    constructor() {
        this.isVisible = false;
        this.container = null;
        this.init();
    }

    /**
     * Initialize the MCP tool management UI
     */
    init() {
        this.createUI();
        this.attachEventListeners();
    }

    /**
     * Create the UI elements
     */
    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'mcp-tool-manager';
        this.container.className = 'mcp-tool-manager hidden';
        
        this.container.innerHTML = `
            <div class="mcp-overlay">
                <div class="mcp-modal">
                    <div class="mcp-header">
                        <h2>🔧 MCP Tool Manager</h2>
                        <button class="mcp-close" id="mcp-close-btn">×</button>
                    </div>
                    
                    <div class="mcp-tabs">
                        <button class="mcp-tab active" data-tab="tools">Tools</button>
                        <button class="mcp-tab" data-tab="categories">Categories</button>
                        <button class="mcp-tab" data-tab="settings">Settings</button>
                    </div>
                    
                    <div class="mcp-content">
                        <div class="mcp-tab-content active" id="mcp-tools-tab">
                            <div class="mcp-stats" id="mcp-stats"></div>
                            <div class="mcp-tools-list" id="mcp-tools-list"></div>
                        </div>
                        
                        <div class="mcp-tab-content" id="mcp-categories-tab">
                            <div class="mcp-categories-grid" id="mcp-categories-grid"></div>
                        </div>
                        
                        <div class="mcp-tab-content" id="mcp-settings-tab">
                            <div class="mcp-settings-section">
                                <h3>🔧 Tool Configuration</h3>
                                <div class="mcp-settings-grid">
                                    <div class="mcp-setting-item">
                                        <label class="mcp-setting-label">Auto-enable new tools</label>
                                        <p class="mcp-setting-description">Automatically enable newly discovered MCP tools</p>
                                        <div class="mcp-setting-control">
                                            <label class="mcp-toggle">
                                                <input type="checkbox" id="mcp-auto-enable" checked>
                                                <span class="mcp-toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mcp-setting-item">
                                        <label class="mcp-setting-label">Tool timeout</label>
                                        <p class="mcp-setting-description">Maximum time to wait for tool responses (seconds)</p>
                                        <div class="mcp-setting-control">
                                            <input type="number" id="mcp-timeout" class="mcp-setting-input" value="30" min="5" max="300">
                                        </div>
                                    </div>
                                    <div class="mcp-setting-item">
                                        <label class="mcp-setting-label">Debug mode</label>
                                        <p class="mcp-setting-description">Enable detailed logging for MCP operations</p>
                                        <div class="mcp-setting-control">
                                            <label class="mcp-toggle">
                                                <input type="checkbox" id="mcp-debug-mode">
                                                <span class="mcp-toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mcp-setting-item">
                                        <label class="mcp-setting-label">Tool priority</label>
                                        <p class="mcp-setting-description">Default priority for new tools</p>
                                        <div class="mcp-setting-control">
                                            <select id="mcp-default-priority" class="mcp-setting-select">
                                                <option value="low">Low</option>
                                                <option value="normal" selected>Normal</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mcp-settings-section">
                                <h3>📁 Import/Export</h3>
                                <div class="mcp-settings-grid">
                                    <div class="mcp-setting-item">
                                        <label class="mcp-setting-label">Export Configuration</label>
                                        <p class="mcp-setting-description">Download current MCP tool configuration as JSON</p>
                                        <div class="mcp-setting-control">
                                            <button id="mcp-export-btn" class="mcp-btn">📤 Export Config</button>
                                        </div>
                                    </div>
                                    <div class="mcp-setting-item">
                                        <label class="mcp-setting-label">Import Configuration</label>
                                        <p class="mcp-setting-description">Upload and apply MCP tool configuration from JSON file</p>
                                        <div class="mcp-setting-control">
                                            <input type="file" id="mcp-import-file" accept=".json" style="display: none;">
                                            <button id="mcp-import-btn" class="mcp-btn">📥 Import Config</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mcp-actions">
                                <button id="mcp-save-btn" class="mcp-btn primary">💾 Save Settings</button>
                                <button id="mcp-reset-btn" class="mcp-btn danger">🔄 Reset to Defaults</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.container);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Close button
        document.getElementById('mcp-close-btn').addEventListener('click', () => {
            this.hide();
        });

        // Tab switching
        document.querySelectorAll('.mcp-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Settings buttons
        document.getElementById('mcp-export-btn').addEventListener('click', () => {
            this.exportConfig();
        });

        document.getElementById('mcp-import-btn').addEventListener('click', () => {
            document.getElementById('mcp-import-file').click();
        });

        document.getElementById('mcp-import-file').addEventListener('change', (e) => {
            this.importConfig(e.target.files[0]);
        });

        document.getElementById('mcp-save-btn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('mcp-reset-btn').addEventListener('click', () => {
            this.resetToDefaults();
        });

        // Close on overlay click
        this.container.querySelector('.mcp-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('mcp-overlay')) {
                this.hide();
            }
        });
    }

    /**
     * Show the MCP tool manager
     */
    show() {
        this.isVisible = true;
        this.container.classList.remove('hidden');
        this.refreshContent();
        this.loadSettings();
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide the MCP tool manager
     */
    hide() {
        this.isVisible = false;
        this.container.classList.add('hidden');
        document.body.style.overflow = '';
    }

    /**
     * Toggle the MCP tool manager visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Switch between tabs
     * @param {string} tabName - Name of the tab to switch to
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.mcp-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.mcp-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `mcp-${tabName}-tab`);
        });

        // Refresh content for the active tab
        this.refreshTabContent(tabName);
    }

    /**
     * Refresh all content
     */
    refreshContent() {
        this.refreshStats();
        this.refreshToolsList();
        this.refreshCategoriesGrid();
    }

    /**
     * Refresh content for a specific tab
     * @param {string} tabName - Name of the tab to refresh
     */
    refreshTabContent(tabName) {
        switch (tabName) {
            case 'tools':
                this.refreshStats();
                this.refreshToolsList();
                break;
            case 'categories':
                this.refreshCategoriesGrid();
                break;
            case 'settings':
                // Settings tab doesn't need refreshing
                break;
        }
    }

    /**
     * Refresh the statistics display
     */
    refreshStats() {
        const stats = mcpConfig.getStats();
        const statsContainer = document.getElementById('mcp-stats');
        
        statsContainer.innerHTML = `
            <div class="mcp-stat">
                <span class="mcp-stat-value">${stats.total}</span>
                <span class="mcp-stat-label">Total Tools</span>
            </div>
            <div class="mcp-stat">
                <span class="mcp-stat-value">${stats.enabled}</span>
                <span class="mcp-stat-label">Enabled</span>
            </div>
            <div class="mcp-stat">
                <span class="mcp-stat-value">${stats.disabled}</span>
                <span class="mcp-stat-label">Disabled</span>
            </div>
            <div class="mcp-stat">
                <span class="mcp-stat-value">${Object.keys(stats.categories).length}</span>
                <span class="mcp-stat-label">Categories</span>
            </div>
        `;
    }

    /**
     * Refresh the tools list
     */
    refreshToolsList() {
        const toolsContainer = document.getElementById('mcp-tools-list');
        const tools = mcpConfig.getAllConfigs();
        
        toolsContainer.innerHTML = tools.map(tool => `
            <div class="mcp-tool-item ${tool.enabled ? 'enabled' : 'disabled'}">
                <div class="mcp-tool-icon" style="color: ${tool.color}">${tool.icon}</div>
                <div class="mcp-tool-info">
                    <h4>${tool.name}</h4>
                    <p>${tool.description}</p>
                    <span class="mcp-tool-category">${tool.category}</span>
                    ${tool.serverSide ? '<span class="mcp-tool-badge">Server-side</span>' : '<span class="mcp-tool-badge">Client-side</span>'}
                </div>
                <div class="mcp-tool-controls">
                    <label class="mcp-toggle">
                        <input type="checkbox" ${tool.enabled ? 'checked' : ''} 
                               onchange="mcpToolUI.toggleTool('${tool.id}', this.checked)">
                        <span class="mcp-toggle-slider"></span>
                    </label>
                </div>
            </div>
        `).join('');
    }

    /**
     * Refresh the categories grid
     */
    refreshCategoriesGrid() {
        const categoriesContainer = document.getElementById('mcp-categories-grid');
        const stats = mcpConfig.getStats();
        
        const categoryInfo = {
            search: { icon: '🔍', name: 'Search' },
            information: { icon: 'ℹ️', name: 'Information' },
            utility: { icon: '🔧', name: 'Utility' },
            system: { icon: '⚙️', name: 'System' },
            development: { icon: '💻', name: 'Development' },
            data: { icon: '📊', name: 'Data' },
            communication: { icon: '💬', name: 'Communication' },
            creative: { icon: '🎨', name: 'Creative' }
        };

        categoriesContainer.innerHTML = Object.entries(stats.categories).map(([category, count]) => {
            const info = categoryInfo[category] || { icon: '📦', name: category };
            return `
                <div class="mcp-category-card">
                    <span class="mcp-category-icon">${info.icon}</span>
                    <div class="mcp-category-name">${info.name}</div>
                    <div class="mcp-category-count">${count} tool${count !== 1 ? 's' : ''}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Toggle a tool's enabled state
     * @param {string} toolId - Tool identifier
     * @param {boolean} enabled - Whether to enable the tool
     */
    toggleTool(toolId, enabled) {
        try {
            mcpConfig.setToolEnabled(toolId, enabled);
            this.refreshContent();
            Logger.info(`Tool ${toolId} ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            Logger.error('Failed to toggle tool', error);
            alert(`Failed to toggle tool: ${error.message}`);
        }
    }

    /**
     * Export configuration to file
     */
    exportConfig() {
        try {
            const config = mcpConfig.exportConfigs();
            const blob = new Blob([config], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `mcp-tools-config-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Logger.info('MCP config exported successfully');
        } catch (error) {
            Logger.error('Failed to export config', error);
            alert(`Failed to export config: ${error.message}`);
        }
    }

    /**
     * Import configuration from file
     * @param {File} file - JSON file containing configuration
     */
    async importConfig(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            mcpConfig.importConfigs(text);
            this.refreshContent();
            Logger.info('MCP config imported successfully');
            alert('Configuration imported successfully!');
        } catch (error) {
            Logger.error('Failed to import config', error);
            alert(`Failed to import config: ${error.message}`);
        }
    }

    /**
     * Save current settings
     */
    saveSettings() {
        try {
            const autoEnable = document.getElementById('mcp-auto-enable').checked;
            const timeout = parseInt(document.getElementById('mcp-timeout').value);
            const debugMode = document.getElementById('mcp-debug-mode').checked;
            const defaultPriority = document.getElementById('mcp-default-priority').value;

            // Save settings to localStorage or config
            const settings = {
                autoEnable,
                timeout,
                debugMode,
                defaultPriority
            };

            localStorage.setItem('mcp-settings', JSON.stringify(settings));
            Logger.info('MCP settings saved', settings);
            alert('Settings saved successfully!');
        } catch (error) {
            Logger.error('Failed to save settings', error);
            alert(`Failed to save settings: ${error.message}`);
        }
    }

    /**
     * Load saved settings
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('mcp-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);

                if (document.getElementById('mcp-auto-enable')) {
                    document.getElementById('mcp-auto-enable').checked = settings.autoEnable ?? true;
                }
                if (document.getElementById('mcp-timeout')) {
                    document.getElementById('mcp-timeout').value = settings.timeout ?? 30;
                }
                if (document.getElementById('mcp-debug-mode')) {
                    document.getElementById('mcp-debug-mode').checked = settings.debugMode ?? false;
                }
                if (document.getElementById('mcp-default-priority')) {
                    document.getElementById('mcp-default-priority').value = settings.defaultPriority ?? 'normal';
                }
            }
        } catch (error) {
            Logger.error('Failed to load settings', error);
        }
    }

    /**
     * Reset configuration to defaults
     */
    resetToDefaults() {
        if (confirm('Are you sure you want to reset all tool configurations to defaults? This cannot be undone.')) {
            try {
                // Clear existing configs and reload defaults
                mcpConfig.toolConfigs.clear();
                mcpConfig.loadDefaultConfigs();
                this.refreshContent();
                Logger.info('MCP config reset to defaults');
                alert('Configuration reset to defaults successfully!');
            } catch (error) {
                Logger.error('Failed to reset config', error);
                alert(`Failed to reset config: ${error.message}`);
            }
        }
    }
}

// Create global instance
export const mcpToolUI = new MCPToolUI();

// Make it globally accessible for HTML event handlers
window.mcpToolUI = mcpToolUI;
