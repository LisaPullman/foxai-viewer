# FoxAI Enhanced Gemini Playground

## 🦊 Overview

This enhanced version of the Gemini Playground includes FoxAI branding, multi-language support, improved UI design, and configurable MCP (Model Context Protocol) tools functionality.

## ✨ New Features

### 1. FoxAI Branding & Animations

- **Animated FoxAI Logo**: Eye-catching fox emoji with bounce animation
- **Gradient Header**: Beautiful orange gradient background with shimmer effect
- **Brand Colors**: Custom FoxAI orange color scheme (`#ff6b35`, `#f7931e`)
- **Responsive Design**: Adapts to different screen sizes

### 2. Multi-Language Support

Complete internationalization system supporting:

- **English** (en) - Default
- **中文** (zh) - Chinese
- **Deutsch** (de) - German  
- **Français** (fr) - French

#### Features:
- Automatic browser language detection
- Persistent language preference storage
- Real-time UI text updates
- Separate UI language and voice language selectors
- Comprehensive translation coverage for all interface elements

#### Translation Coverage:
- Interface labels and buttons
- System messages and notifications
- Error messages
- Voice options
- Settings and configuration panels

### 3. Enhanced UI Design

#### Visual Improvements:
- **Glass Morphism**: Frosted glass effects with backdrop blur
- **Modern Gradients**: Beautiful background gradients and button styles
- **Improved Typography**: Better font choices and spacing
- **Enhanced Animations**: Smooth transitions and hover effects
- **Better Color Scheme**: Improved contrast and accessibility

#### Component Enhancements:
- **Redesigned Buttons**: Gradient backgrounds with hover animations
- **Modern Input Fields**: Glass morphism styling with focus states
- **Enhanced Log Container**: Better visual hierarchy and readability
- **Improved Settings Panel**: Collapsible design with smooth animations
- **Responsive Layout**: Better mobile experience

### 4. MCP Tools Configuration System

#### Core Features:
- **Tool Management Interface**: Graphical tool configuration panel
- **Dynamic Tool Loading**: Enable/disable tools without code changes
- **Category Organization**: Tools organized by functional categories
- **Import/Export**: Save and share tool configurations
- **Real-time Statistics**: Tool usage and status monitoring

#### Tool Categories:
- 🔍 **Search**: Web search and information retrieval
- ℹ️ **Information**: Weather, news, and data services
- 🔧 **Utility**: Calculators, converters, and helpers
- ⚙️ **System**: File management and system operations
- 💻 **Development**: Code execution and development tools
- 📊 **Data**: Database queries and data processing
- 💬 **Communication**: Email, messaging, and notifications
- 🎨 **Creative**: Image generation and creative tools

#### Built-in Tools:
- **Google Search**: Web search integration (server-side)
- **Weather Tool**: Mock weather forecasting with realistic data
- **Calculator Tool**: Mathematical expression evaluation (example)

#### Configuration Features:
- **Visual Tool Manager**: Easy-to-use interface for tool management
- **Tool Statistics**: Overview of enabled/disabled tools by category
- **Bulk Operations**: Enable/disable multiple tools at once
- **Configuration Persistence**: Settings saved in localStorage
- **Validation System**: Ensures tool configurations are valid

## 🚀 Usage

### Language Switching
1. Click the settings gear icon
2. Select your preferred UI language from the "UI Language" dropdown
3. Voice language can be set separately for Gemini API interactions

### MCP Tools Management
1. Click the extension icon (🧩) next to the settings button
2. Browse available tools by category
3. Enable/disable tools using the toggle switches
4. Export/import configurations in the Settings tab
5. View tool statistics and usage information

### Tool Development
To add new MCP tools:

1. Create a new tool class in `src/static/js/tools/`
2. Implement `getDeclaration()` and `execute()` methods
3. Add tool configuration to `mcp-config.js`
4. Register the tool in `tool-manager.js`

Example tool structure:
```javascript
export class MyTool {
    getDeclaration() {
        return [{
            name: "my_function",
            description: "Description of what this tool does",
            parameters: {
                type: "object",
                properties: {
                    param1: {
                        type: "string",
                        description: "Parameter description"
                    }
                },
                required: ["param1"]
            }
        }];
    }

    async execute(args) {
        // Tool implementation
        return result;
    }
}
```

## 🎨 Customization

### Colors
The FoxAI color scheme can be customized in `src/static/css/style.css`:
```css
:root {
    --foxai-orange: #ff6b35;
    --foxai-gradient: linear-gradient(135deg, #ff6b35, #f7931e);
}
```

### Translations
Add new languages by extending the `translations` object in `src/static/js/i18n/translations.js`.

### Tools
Configure available tools in `src/static/js/tools/mcp-config.js` or use the visual tool manager interface.

## 📱 Mobile Support

All new features are fully responsive and optimized for mobile devices:
- Touch-friendly interface elements
- Adaptive layouts for small screens
- Optimized animations for mobile performance
- Accessible design patterns

## 🔧 Technical Implementation

### Architecture
- **Modular Design**: Separate modules for i18n, MCP tools, and UI components
- **Event-Driven**: Reactive updates when configurations change
- **Persistent Storage**: Settings saved in localStorage
- **Error Handling**: Comprehensive error boundaries and logging

### Performance
- **Lazy Loading**: Tools loaded only when needed
- **Efficient Animations**: Hardware-accelerated CSS animations
- **Optimized Rendering**: Minimal DOM manipulation
- **Memory Management**: Proper cleanup of event listeners

### Security
- **Input Validation**: All user inputs validated and sanitized
- **Safe Evaluation**: Mathematical expressions evaluated safely
- **XSS Prevention**: Proper escaping of dynamic content
- **Configuration Validation**: Tool configurations validated before use

## 🌟 Future Enhancements

The MCP tools system is designed for easy extension. Planned features include:
- More built-in tools (file manager, code executor, etc.)
- Tool marketplace integration
- Advanced tool chaining and workflows
- Custom tool templates and wizards
- Integration with external MCP servers

---

**Powered by FoxAI** 🦊 | Enhanced Gemini Playground with modern design and extensible architecture.
