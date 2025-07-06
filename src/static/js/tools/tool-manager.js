import { Logger } from '../utils/logger.js';
import { ApplicationError, ErrorCodes } from '../utils/error-boundary.js';
import { GoogleSearchTool } from './google-search.js';
import { WeatherTool } from './weather-tool.js';
import { mcpConfig } from './mcp-config.js';

/**
 * Manages the registration and execution of tools.
 * Tools are used to extend the functionality of the Gemini API, allowing it to interact with external services.
 */
export class ToolManager {
    /**
     * Creates a new ToolManager and registers default tools.
     */
    constructor() {
        this.tools = new Map();
        this.registerDefaultTools();
    }

    /**
     * Registers the default tools: GoogleSearchTool and WeatherTool.
     * Only registers tools that are enabled in the MCP configuration.
     */
    registerDefaultTools() {
        // Check MCP config to see which tools should be enabled
        const googleSearchConfig = mcpConfig.getConfig('google_search');
        const weatherConfig = mcpConfig.getConfig('weather');

        if (googleSearchConfig && googleSearchConfig.enabled) {
            this.registerTool('googleSearch', new GoogleSearchTool());
        }

        if (weatherConfig && weatherConfig.enabled) {
            this.registerTool('weather', new WeatherTool());
        }

        Logger.info('Registered tools based on MCP configuration', {
            googleSearch: googleSearchConfig?.enabled || false,
            weather: weatherConfig?.enabled || false
        });
    }

    /**
     * Registers a new tool.
     *
     * @param {string} name - The name of the tool.
     * @param {Object} toolInstance - The tool instance. Must have a `getDeclaration` method.
     * @throws {ApplicationError} Throws an error if a tool with the same name is already registered.
     */
    registerTool(name, toolInstance) {
        if (this.tools.has(name)) {
            throw new ApplicationError(
                `Tool ${name} is already registered`,
                ErrorCodes.INVALID_STATE
            );
        }
        this.tools.set(name, toolInstance);
        Logger.info(`Tool ${name} registered successfully`);
    }

    /**
     * Returns the tool declarations for all registered tools.
     * These declarations are used by the Gemini API to understand what tools are available.
     *
     * @returns {Object[]} An array of tool declarations.
     */
    getToolDeclarations() {
        const allDeclarations = [];
        
        this.tools.forEach((tool, name) => {
            if (tool.getDeclaration) {
                if (name === 'weather') {
                    allDeclarations.push({
                        functionDeclarations: tool.getDeclaration()
                    });
                } else {
                    allDeclarations.push({ [name]: tool.getDeclaration() });
                }
            }
        });

        return allDeclarations;
    }

    /**
     * Handles a tool call from the Gemini API.
     * Executes the specified tool with the given arguments.
     *
     * @param {Object} functionCall - The function call object from the Gemini API.
     * @param {string} functionCall.name - The name of the tool to execute.
     * @param {Object} functionCall.args - The arguments to pass to the tool.
     * @param {string} functionCall.id - The ID of the function call.
     * @returns {Promise<Object>} A promise that resolves with the tool's response.
     * @throws {ApplicationError} Throws an error if the tool is unknown or if the tool execution fails.
     */
    async handleToolCall(functionCall) {
        const { name, args, id } = functionCall;
        Logger.info(`Handling tool call: ${name}`, { args });

        let tool;
        if (name === 'get_weather_on_date') {
            tool = this.tools.get('weather');
        } else {
            tool = this.tools.get(name);
        }

        if (!tool) {
            throw new ApplicationError(
                `Unknown tool: ${name}`,
                ErrorCodes.INVALID_PARAMETER
            );
        }

        try {
            const result = await tool.execute(args);
            return {
                functionResponses: [{
                    response: { output: result },
                    id
                }]
            };
        } catch (error) {
            Logger.error(`Tool execution failed: ${name}`, error);
            return {
                functionResponses: [{
                    response: { error: error.message },
                    id
                }]
            };
        }
    }

    /**
     * Reload tools based on current MCP configuration.
     * This method can be called when MCP settings change.
     */
    reloadTools() {
        // Clear existing tools
        this.tools.clear();

        // Re-register tools based on current configuration
        this.registerDefaultTools();

        Logger.info('Tools reloaded based on MCP configuration');
    }

    /**
     * Get information about all registered tools.
     * @returns {Array} Array of tool information objects.
     */
    getToolsInfo() {
        const toolsInfo = [];

        this.tools.forEach((tool, name) => {
            const config = mcpConfig.getConfig(name === 'googleSearch' ? 'google_search' : name);
            toolsInfo.push({
                name,
                enabled: config?.enabled || false,
                config: config || null,
                hasDeclaration: typeof tool.getDeclaration === 'function',
                hasExecute: typeof tool.execute === 'function'
            });
        });

        return toolsInfo;
    }
}