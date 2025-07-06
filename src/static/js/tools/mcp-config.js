/**
 * MCP (Model Context Protocol) Tool Configuration System
 * This module provides a framework for configuring and managing MCP tools
 * that can be dynamically loaded and integrated with the Gemini API.
 */

import { Logger } from '../utils/logger.js';
import { ApplicationError, ErrorCodes } from '../utils/error-boundary.js';

/**
 * MCP Tool Configuration Manager
 * Handles the configuration, validation, and management of MCP tools
 */
export class MCPConfig {
    constructor() {
        this.mcpTools = new Map();
        this.toolConfigs = new Map();
        this.loadDefaultConfigs();
    }

    /**
     * Load default MCP tool configurations
     */
    loadDefaultConfigs() {
        // Default configurations for built-in tools
        this.addToolConfig('google_search', {
            name: 'Google Search',
            description: 'Search the web using Google',
            category: 'search',
            enabled: true,
            serverSide: true, // Handled by Gemini API
            icon: '🔍',
            color: '#4285f4'
        });

        this.addToolConfig('weather', {
            name: 'Weather Forecast',
            description: 'Get weather information for any location',
            category: 'information',
            enabled: true,
            serverSide: false, // Client-side implementation
            icon: '🌤️',
            color: '#ff9800'
        });

        // Example configurations for future MCP tools
        this.addToolConfig('calculator', {
            name: 'Calculator',
            description: 'Perform mathematical calculations',
            category: 'utility',
            enabled: false,
            serverSide: false,
            icon: '🧮',
            color: '#9c27b0'
        });

        this.addToolConfig('file_manager', {
            name: 'File Manager',
            description: 'Manage files and directories',
            category: 'system',
            enabled: false,
            serverSide: false,
            icon: '📁',
            color: '#607d8b'
        });

        this.addToolConfig('code_executor', {
            name: 'Code Executor',
            description: 'Execute code snippets safely',
            category: 'development',
            enabled: false,
            serverSide: false,
            icon: '💻',
            color: '#4caf50'
        });

        this.addToolConfig('database_query', {
            name: 'Database Query',
            description: 'Query databases and data sources',
            category: 'data',
            enabled: false,
            serverSide: false,
            icon: '🗄️',
            color: '#2196f3'
        });

        this.addToolConfig('email_sender', {
            name: 'Email Sender',
            description: 'Send emails and notifications',
            category: 'communication',
            enabled: false,
            serverSide: false,
            icon: '📧',
            color: '#f44336'
        });

        this.addToolConfig('image_generator', {
            name: 'Image Generator',
            description: 'Generate images using AI',
            category: 'creative',
            enabled: false,
            serverSide: true,
            icon: '🎨',
            color: '#e91e63'
        });
    }

    /**
     * Add a tool configuration
     * @param {string} toolId - Unique identifier for the tool
     * @param {Object} config - Tool configuration object
     */
    addToolConfig(toolId, config) {
        const validatedConfig = this.validateToolConfig(config);
        this.toolConfigs.set(toolId, {
            id: toolId,
            ...validatedConfig,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        Logger.info(`MCP tool config added: ${toolId}`, validatedConfig);
    }

    /**
     * Validate tool configuration
     * @param {Object} config - Tool configuration to validate
     * @returns {Object} Validated configuration
     */
    validateToolConfig(config) {
        const required = ['name', 'description', 'category', 'enabled'];
        const missing = required.filter(field => !(field in config));
        
        if (missing.length > 0) {
            throw new ApplicationError(
                `Missing required fields in tool config: ${missing.join(', ')}`,
                ErrorCodes.INVALID_PARAMETER
            );
        }

        const validCategories = [
            'search', 'information', 'utility', 'system', 
            'development', 'data', 'communication', 'creative'
        ];

        if (!validCategories.includes(config.category)) {
            throw new ApplicationError(
                `Invalid category: ${config.category}. Must be one of: ${validCategories.join(', ')}`,
                ErrorCodes.INVALID_PARAMETER
            );
        }

        return {
            name: config.name,
            description: config.description,
            category: config.category,
            enabled: Boolean(config.enabled),
            serverSide: Boolean(config.serverSide),
            icon: config.icon || '🔧',
            color: config.color || '#666666',
            permissions: config.permissions || [],
            settings: config.settings || {}
        };
    }

    /**
     * Get all tool configurations
     * @returns {Array} Array of tool configurations
     */
    getAllConfigs() {
        return Array.from(this.toolConfigs.values());
    }

    /**
     * Get enabled tool configurations
     * @returns {Array} Array of enabled tool configurations
     */
    getEnabledConfigs() {
        return this.getAllConfigs().filter(config => config.enabled);
    }

    /**
     * Get tool configurations by category
     * @param {string} category - Tool category
     * @returns {Array} Array of tool configurations in the category
     */
    getConfigsByCategory(category) {
        return this.getAllConfigs().filter(config => config.category === category);
    }

    /**
     * Get tool configuration by ID
     * @param {string} toolId - Tool identifier
     * @returns {Object|null} Tool configuration or null if not found
     */
    getConfig(toolId) {
        return this.toolConfigs.get(toolId) || null;
    }

    /**
     * Update tool configuration
     * @param {string} toolId - Tool identifier
     * @param {Object} updates - Configuration updates
     */
    updateConfig(toolId, updates) {
        const existing = this.toolConfigs.get(toolId);
        if (!existing) {
            throw new ApplicationError(
                `Tool config not found: ${toolId}`,
                ErrorCodes.NOT_FOUND
            );
        }

        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date()
        };

        this.toolConfigs.set(toolId, this.validateToolConfig(updated));
        Logger.info(`MCP tool config updated: ${toolId}`, updates);
    }

    /**
     * Enable/disable a tool
     * @param {string} toolId - Tool identifier
     * @param {boolean} enabled - Whether to enable the tool
     */
    setToolEnabled(toolId, enabled) {
        this.updateConfig(toolId, { enabled });
    }

    /**
     * Remove tool configuration
     * @param {string} toolId - Tool identifier
     */
    removeConfig(toolId) {
        if (this.toolConfigs.delete(toolId)) {
            Logger.info(`MCP tool config removed: ${toolId}`);
        }
    }

    /**
     * Export configurations to JSON
     * @returns {string} JSON string of all configurations
     */
    exportConfigs() {
        const configs = Object.fromEntries(this.toolConfigs);
        return JSON.stringify(configs, null, 2);
    }

    /**
     * Import configurations from JSON
     * @param {string} jsonString - JSON string of configurations
     */
    importConfigs(jsonString) {
        try {
            const configs = JSON.parse(jsonString);
            for (const [toolId, config] of Object.entries(configs)) {
                this.addToolConfig(toolId, config);
            }
            Logger.info('MCP tool configs imported successfully');
        } catch (error) {
            throw new ApplicationError(
                `Failed to import configs: ${error.message}`,
                ErrorCodes.INVALID_PARAMETER
            );
        }
    }

    /**
     * Get tool statistics
     * @returns {Object} Statistics about configured tools
     */
    getStats() {
        const all = this.getAllConfigs();
        const enabled = this.getEnabledConfigs();
        const categories = {};
        
        all.forEach(config => {
            categories[config.category] = (categories[config.category] || 0) + 1;
        });

        return {
            total: all.length,
            enabled: enabled.length,
            disabled: all.length - enabled.length,
            categories,
            serverSide: all.filter(c => c.serverSide).length,
            clientSide: all.filter(c => !c.serverSide).length
        };
    }
}

// Create global instance
export const mcpConfig = new MCPConfig();
