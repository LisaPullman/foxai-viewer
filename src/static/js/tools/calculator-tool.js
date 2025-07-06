/**
 * Calculator Tool - Example MCP Tool Implementation
 * Demonstrates how to create a custom tool for mathematical calculations
 */

import { Logger } from '../utils/logger.js';
import { ApplicationError, ErrorCodes } from '../utils/error-boundary.js';

export class CalculatorTool {
    /**
     * Returns the tool declaration for the Gemini API.
     * @returns {Object[]} Array of function declarations
     */
    getDeclaration() {
        return [{
            name: "calculate",
            description: "Perform mathematical calculations with basic arithmetic operations",
            parameters: {
                type: "object",
                properties: {
                    expression: {
                        type: "string",
                        description: "Mathematical expression to evaluate (e.g., '2 + 3 * 4', 'sqrt(16)', 'sin(30)')"
                    }
                },
                required: ["expression"]
            }
        }];
    }

    /**
     * Execute the calculator tool
     * @param {Object} args - Tool arguments
     * @param {string} args.expression - Mathematical expression to evaluate
     * @returns {Promise<Object>} Calculation result
     */
    async execute(args) {
        try {
            Logger.info('Executing Calculator Tool', args);
            const { expression } = args;

            if (!expression || typeof expression !== 'string') {
                throw new ApplicationError(
                    'Invalid expression provided',
                    ErrorCodes.INVALID_PARAMETER
                );
            }

            // Sanitize and evaluate the expression
            const result = this.evaluateExpression(expression.trim());

            return {
                expression,
                result,
                type: typeof result,
                formatted: this.formatResult(result),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            Logger.error('Calculator Tool failed', error);
            throw new ApplicationError(
                `Calculation failed: ${error.message}`,
                ErrorCodes.EXECUTION_ERROR
            );
        }
    }

    /**
     * Safely evaluate a mathematical expression
     * @param {string} expression - Expression to evaluate
     * @returns {number} Calculation result
     */
    evaluateExpression(expression) {
        // Remove any potentially dangerous characters
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
        
        // Basic validation
        if (!sanitized || sanitized.length === 0) {
            throw new Error('Empty or invalid expression');
        }

        // Check for balanced parentheses
        if (!this.hasBalancedParentheses(sanitized)) {
            throw new Error('Unbalanced parentheses in expression');
        }

        try {
            // Use Function constructor for safer evaluation than eval()
            const result = new Function('return ' + sanitized)();
            
            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error('Invalid calculation result');
            }

            return result;
        } catch (error) {
            throw new Error(`Invalid mathematical expression: ${error.message}`);
        }
    }

    /**
     * Check if parentheses are balanced in the expression
     * @param {string} expression - Expression to check
     * @returns {boolean} True if balanced
     */
    hasBalancedParentheses(expression) {
        let count = 0;
        for (const char of expression) {
            if (char === '(') count++;
            if (char === ')') count--;
            if (count < 0) return false;
        }
        return count === 0;
    }

    /**
     * Format the result for display
     * @param {number} result - Calculation result
     * @returns {string} Formatted result
     */
    formatResult(result) {
        if (Number.isInteger(result)) {
            return result.toString();
        }
        
        // Round to reasonable precision
        if (Math.abs(result) < 0.001 || Math.abs(result) > 1e10) {
            return result.toExponential(6);
        }
        
        return result.toFixed(6).replace(/\.?0+$/, '');
    }
}
