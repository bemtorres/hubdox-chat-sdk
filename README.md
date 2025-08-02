# Hubdox Chat SDK

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://www.npmjs.com/package/hubdox-chat-sdk)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)

Developed by [Bemtorres](https://github.com/bemtorres)

A lightweight and easy-to-use JavaScript SDK for integrating a floating chatbot into any website. The chat widget is highly customizable and integrates seamlessly with existing chat APIs.

## 🚀 Features

- **Floating widget**: A floating button that expands into a full chat panel.
- **Responsive design**: Automatically adapts to different screen sizes.
- **Fullscreen mode on mobile**: Automatic expansion to fullscreen on mobile devices.
- **Separate registration screen**: A dedicated welcome screen where the bot greets and asks for the user's name before starting the chat.
- **Highly customizable**: Configurable colors, texts, images, and styles.
- **Easy integration**: Single line of code to implement.
- **Bootstrap included**: Uses Bootstrap 5 for modern and professional design.
- **Avatar support**: Profile images for user and bot.
- **Typing indicator**: Shows when the bot is processing a response.
- **State management**: Automatic handling of messages and sessions, with optional caching.
- **Minimalist design**: Clean and easy-to-use interface.
- **Simplified system**: Only 2 APIs (registration and message).
- **Automatic configuration**: The bot configures itself automatically from the API.
- **Dynamic updates**: The user interface updates automatically with the bot's configuration.
- **Test mode**: A test mode for development and testing without a live API.
- **Markdown support**: Automatic rendering of Markdown text in bot responses.
- **Simulated streaming**: Character-by-character typing effect to simulate real-time writing.
- **Development mode**: Configurable logging system for development and production.

## 📦 Installation

### CDN (Recommended)

Latest version:
```html
<script src="https://cdn.jsdelivr.net/npm/hubdox-chat-sdk"></script>
```

### NPM

```bash
npm install hubdox-chat-sdk
```

```javascript
import ChatBot from 'hubdox-chat-sdk';
```

## 🛠️ Basic Usage

```javascript
const chat = new ChatBot({
  baseUrl: 'https://your-api.com',
  apiKey: 'your-api-key',
  tenant: 'your-tenant',
  options: {
    register: true, // Optional: requests user information on startup
  },
  user: {
    name: 'User',
    email: 'user@example.com',
    photo: 'https://example.com/avatar.jpg'
  },
  bot: {
    name: 'Assistant',
    img: 'https://example.com/bot-avatar.jpg'
  }
});
```

## ⚙️ Configuration

### Required Options

| Parameter | Type   | Description                            |
|-----------|--------|----------------------------------------|
| `baseUrl` | string | Base URL of your chat API              |
| `apiKey`  | string | API key for authentication (Bearer token) |
| `tenant`  | string | Tenant/organization identifier         |

### `options` Object (Optional)

| Parameter  | Type    | Default | Description                                                                 |
|------------|---------|---------|-----------------------------------------------------------------------------|
| `register` | boolean | `false` | If `true`, shows a registration screen where the bot asks for the user's name before starting the chat. |
| `show`     | boolean | `true`  | Shows or hides the chat widget on initialization.                           |
| `cache`    | boolean | `true`  | Enables or disables caching of chat session and messages.                   |
| `testMode` | boolean | `false` | Enables or disables test mode.                                             |
| `stream`   | boolean | `false` | If `true`, simulates typing effect showing the message character by character. |
| `devMode`  | boolean | `false` | Enables development logs. Should be `false` in production.                 |

### `user` Object (Optional)

| Parameter | Type   | Default                                                                              | Description              |
|-----------|--------|--------------------------------------------------------------------------------------|--------------------------|
| `name`    | string | `'User'`                                                                             | User's name.             |
| `email`   | string | `'test@mail.com'`                                                                    | User's email address.    |
| `photo`   | string | `'https://res.cloudinary.com/dienilw2p/image/upload/v1747635921/hubdox/lgvqg0648leq6meeusid.png'` | User's profile photo URL. |

### `bot` Object (Optional)

| Parameter | Type   | Default                                                                              | Description           |
|-----------|--------|--------------------------------------------------------------------------------------|-----------------------|
| `name`    | string | `'Bot'`                                                                              | Bot's name.           |
| `img`     | string | `'https://res.cloudinary.com/dienilw2p/image/upload/v1747635921/hubdox/xevgjbvb1ri3ytpletzk.png'` | Bot's image URL.      |

### `custom` Object (Optional)

| Parameter           | Type    | Default        | Description                                                              |
|---------------------|---------|----------------|--------------------------------------------------------------------------|
| `primaryColor`      | string  | `'#0d6efd'`    | The primary color of the chat widget.                                    |
| `botName`           | string  | `'Bot'`        | The bot's name displayed in the chat header.                             |
| `headerBgColor`     | string  | `primaryColor` | The background color of the chat header.                                 |
| `headerTextColor`   | string  | `'#ffffff'`    | The text color of the chat header.                                       |
| `sendButtonText`    | string  | `null`         | The send button text.                                                     |
| `iconButton`        | string  | `null`         | The URL of a custom icon for the floating button.                        |
| `chatWidth`         | string  | `'400px'`      | The width of the chat panel on desktop.                                  |
| `chatHeight`        | string  | `'60vh'`       | The height of the chat panel on desktop.                                 |
| `chatMaxWidth`      | string  | `'90vw'`       | The maximum width of the chat panel on mobile.                           |
| `chatMaxHeight`     | string  | `'60vh'`       | The maximum height of the chat panel on mobile.                          |
| `messagesHeight`    | string  | `'350px'`      | The height of the messages container.                                    |
| `buttonSize`        | string  | `'56px'`       | The size of the floating button.                                         |
| `fullscreenEnabled` | boolean | `true`         | Enables or disables fullscreen mode on mobile.                           |
| `showTime`          | boolean | `true`         | If `true`, shows the time in each chat message.                          |
| `position`          | object  | `{ bottom: '24px', right: '24px' }` | The position of the floating button with `top`, `bottom`, `left`, `right` and `transform` properties. |

## 📝 Examples

### Basic Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my site</h1>
  
  <script src="https://cdn.jsdelivr.net/npm/hubdox-chat-sdk@0.1.0"></script>
  <script>
    const chat = new ChatBot({
      baseUrl: 'https://my-api.com',
      apiKey: 'my-api-key-123',
      tenant: 'my-tenant',
      options: {
        register: true, // Enables conversational registration
      },
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        photo: 'https://example.com/john-avatar.jpg'
      },
      bot: {
        name: 'Virtual Assistant',
        img: 'https://example.com/bot-avatar.jpg'
      }
    });
  </script>
</body>
</html>
```

### Registration Screen Example

```javascript
const chat = new ChatBot({
  baseUrl: 'https://api.mycompany.com',
  apiKey: 'sk-1234567890abcdef',
  tenant: 'mycompany-prod',
  options: {
    register: true, // Enables registration screen
  },
  user: {
    name: 'User', // Registration screen will be shown
    email: 'user@mycompany.com',
    photo: 'https://mycompany.com/avatars/default.jpg'
  },
  bot: {
    name: 'Virtual Assistant',
    img: 'https://mycompany.com/bots/assistant.jpg'
  },
  custom: {
    primaryColor: '#ff6b35',
    botName: 'AI Support',
    headerBgColor: '#2c3e50',
    headerTextColor: '#ecf0f1',
    sendButtonText: 'Send Message',
    showTime: true
  }
});
```

### Custom Example (No Registration)

```javascript
const chat = new ChatBot({
  baseUrl: 'https://api.mycompany.com',
  apiKey: 'sk-1234567890abcdef',
  tenant: 'mycompany-prod',
  options: {
    register: false, // No registration screen
  },
  user: {
    name: 'Mary Garcia', // Already registered user
    email: 'mary@mycompany.com',
    photo: 'https://mycompany.com/avatars/mary.jpg'
  },
  bot: {
    name: 'Technical Support',
    img: 'https://mycompany.com/bots/support.jpg'
  },
  custom: {
    primaryColor: '#ff6b35',
    botName: 'AI Support',
    headerBgColor: '#2c3e50',
    headerTextColor: '#ecf0f1',
    sendButtonText: 'Send Message',
    showTime: true
  }
});
```

### Streaming Example

```javascript
const chat = new ChatBot({
  baseUrl: 'https://api.mycompany.com',
  apiKey: 'sk-1234567890abcdef',
  tenant: 'mycompany-prod',
  options: {
    register: true,
    stream: true,      // Enables streaming effect
    devMode: true,     // Development logs (development only)
  },
  user: {
    name: 'User',
    email: 'user@mycompany.com',
    photo: 'https://mycompany.com/avatars/default.jpg'
  },
  bot: {
    name: 'AI Assistant',
    img: 'https://mycompany.com/bots/assistant.jpg'
  },
  custom: {
    primaryColor: '#6366f1',
    botName: 'Virtual Assistant',
    headerBgColor: '#4f46e5',
    headerTextColor: '#ffffff',
    showTime: true
  }
});
```

## 🔧 Server API

The SDK is designed to communicate with two main endpoints on your backend server.

### 1. Session Registration (`/api/sdk/v1/register`)

This endpoint is called when the chat widget is initialized. Its purpose is to register a new chat session and obtain the initial bot and license configuration.

- **Method:** `POST`
- **Headers:**
  - `Authorization`: `Bearer {apiKey}`
  - `Content-Type`: `application/json`

#### Request Parameters (Request Body)

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| `apiKey`  | string | Yes      | The API key for authentication.       |
| `tenant`  | string | Yes      | The tenant/organization identifier.   |

**Request Example:**
```json
{
  "apiKey": "sk-1234567890abcdef",
  "tenant": "my-tenant"
}
```

#### Response Parameters (Response Body)

| Parameter | Type   | Description                                                                                             |
|-----------|--------|---------------------------------------------------------------------------------------------------------|
| `session` | string | A unique identifier for the chat session. The SDK will store it and send it in subsequent message requests. |
| `license` | object | An object containing information about the client's license.                                           |
| `chatbot` | object | An object containing the bot's configuration.                                                          |

**License Object Structure:**

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| `name`       | string  | The license holder's name (e.g., "Hubdox").           |
| `logo`       | string  | The URL of the license holder's logo.                  |
| `active`     | boolean | Indicates if the license is active.                    |
| `url`        | string  | The URL that the license footer will link to.          |
| `showFooter` | boolean | If `true`, a "Powered by" footer will be displayed.    |

**Chatbot Object Structure:**

| Parameter         | Type   | Description                                           |
|-------------------|--------|-------------------------------------------------------|
| `name`            | string | The bot's name (e.g., "Virtual Assistant").          |
| `photo`           | string | The URL of the bot's profile image.                   |
| `initial_message` | string | The first message the bot will send to the user.      |

**Response Example:**
```json
{
  "session": "sess_a1b2c3d4e5f6",
  "license": {
    "name": "Hubdox",
    "logo": "https://cdn.hubdox.com/logo.png",
    "active": true,
    "url": "https://hubdox.com",
    "showFooter": true
  },
  "chatbot": {
    "name": "Sales Assistant",
    "photo": "https://cdn.example.com/bot-avatar.png",
    "initial_message": "Hello! 👋 How can I help you find the perfect product today?"
  }
}
```

---

### 2. Message Sending (`/api/sdk/v1/message`)

This endpoint is called every time a user sends a message through the chat widget.

- **Method:** `POST`
- **Headers:**
  - `Authorization`: `Bearer {apiKey}`
  - `Content-Type`: `application/json`

#### Request Parameters (Request Body)

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| `apiKey`  | string | Yes      | The API key for authentication.                  |
| `tenant`  | string | Yes      | The tenant/organization identifier.              |
| `session` | string | Yes      | The session ID obtained from the registration endpoint. |
| `message` | string | Yes      | The user's text message.                         |
| `name`    | string | No       | The user's name.                                 |
| `stream`  | boolean| No       | If `true`, indicates that streaming should be used. |

**Request Example:**
```json
{
  "apiKey": "sk-1234567890abcdef",
  "tenant": "my-tenant",
  "session": "sess_a1b2c3d4e5f6",
  "message": "Hello, I'd like to know more about product X.",
  "name": "John Doe",
  "stream": false
}
```

#### Response Parameters (Response Body)

| Parameter | Type   | Description                     |
|-----------|--------|---------------------------------|
| `answer`  | string | The bot's text response.        |

**Streaming Note**: If `stream: true` is sent in the request, the SDK will simulate the streaming effect by showing the response character by character, regardless of whether the server supports real streaming or not.

**Response Example:**
```json
{
  "answer": "Of course! Product X is one of our best options. What would you like to know specifically about it?"
}
```

## ⚙️ Public Methods

### `toggleChatPanel()`

Toggles the chat panel visibility.

```javascript
chat.toggleChatPanel();
```

### `hideChatPanel()`

Hides the chat panel.

```javascript
chat.hideChatPanel();
```

### `sendMessage(message)`

Sends a message to the bot.

```javascript
chat.sendMessage('Hello, I need help.');
```

### `clearCache()`

Clears the cached chat session and messages.

```javascript
chat.clearCache();
```

### `reloadFromCache()`

Reloads the chat session and messages from cache.

```javascript
chat.reloadFromCache();
```

### `getCacheStatus()`

Gets the cache status.

```javascript
const status = chat.getCacheStatus();
console.log(status);
```

### `getRegistrationStatus()`

Gets the user registration status.

```javascript
const status = chat.getRegistrationStatus();
console.log(status);
```

## 🎯 Registration Screen

The new registration screen functionality clearly separates the registration process from normal chat, avoiding confusion and improving user experience.

### When is the registration screen shown?

The registration screen is automatically displayed when any of these conditions are met:

1. **When `register: true`** - The registration option is enabled
2. **When the user's name doesn't exist** - The user doesn't have a valid name
3. **When the user is not registered** - The registration process hasn't been completed

### Registration screen flow

1. **Welcome**: The bot shows a welcome screen with its image
2. **Name request**: Asks the user to type their name
3. **Confirmation**: Confirms the name and transitions to chat
4. **Normal chat**: Starts the chat with a personalized message

### Configuration example

```javascript
const chat = new ChatBot({
  baseUrl: 'https://your-api.com',
  apiKey: 'your-api-key',
  tenant: 'your-tenant',
  options: {
    register: true, // Enables registration screen
    testMode: true  // For testing without real API
  },
  user: {
    name: "User", // Registration screen will be shown
    email: 'user@example.com'
  }
});
```

## 🧪 Test Mode

When `testMode: true` is enabled, the chat widget uses a predefined set of responses for testing purposes, without needing a live API.

```javascript
const chat = new ChatBot({
  // ... other options
  options: {
    testMode: true,
  }
});
```

## 📝 Markdown Support

The ChatBot includes complete support for rendering Markdown text in bot responses. The following formats are supported:

### Supported Formats

| Format | Syntax | Result |
|--------|--------|--------|
| **Bold** | `**text**` | **text** |
| *Italic* | `*text*` | *text* |
| `Inline code` | `` `code` `` | `code` |
| **Code block** | ```` ```code``` ```` | Code block with highlighting |
| [Links](https://example.com) | `[text](url)` | External links |
| **Headers** | `# Header`, `## Subheader` | Headers with hierarchy |
| **Lists** | `- item` or `1. item` | Ordered and unordered lists |

### Response with Markdown Example

```javascript
// The bot can respond with Markdown
const response = `# Hello! 👋

I help you with **Markdown formatting**. Here are some examples:

## Main features:
- **Bold** for emphasis
- *Italic* for details
- \`inline code\` for commands
- [Links](https://example.com) for resources

## Code example:
\`\`\`javascript
function greet() {
    console.log("Hello world!");
}
\`\`\``;
```

### Security

The Markdown parser includes protection against XSS (Cross-Site Scripting) by automatically escaping malicious HTML in the input text.

## ⚡ Simulated Streaming

The ChatBot SDK includes a simulated streaming functionality that allows showing bot responses character by character, creating a visual effect similar to ChatGPT.

### How does it work?

When `stream: true` is enabled:

1. **Typing indicator**: The "is typing..." indicator is shown first
2. **Text streaming**: The message appears progressively character by character
3. **Blinking cursor**: An animated cursor indicates the bot is "typing"
4. **Variable speed**: Different speeds for spaces, punctuation, and normal characters

### Configuration

```javascript
const chat = new ChatBot({
  // ... other options
  options: {
    stream: true,  // Enables simulated streaming
  }
});
```

### Behavior

- **With `stream: true`**: Message appears character by character with blinking cursor
- **With `stream: false`**: Message appears complete at once

### Customization

The streaming includes:
- **Blinking cursor** with the chat's primary color
- **Left border** special during streaming
- **Subtle gradient background** to highlight the message
- **Variable speed** that simulates human typing

## 🔧 Development Mode

The SDK includes a configurable logging system to facilitate development and debugging.

### Configuration

```javascript
const chat = new ChatBot({
  // ... other options
  options: {
    devMode: true,  // Enables development logs
  }
});
```

### Log Types

- **`_log()`**: General informational logs
- **`_logError()`**: Errors (always visible)
- **`_logWarn()`**: Warnings (development mode only)
- **`_logInfo()`**: Additional information (development mode only)
- **`_logDebug()`**: Debugging information (development mode only)

### Production Usage

```javascript
// For production, disable logs
options: {
  devMode: false,  // Disables logs for better performance
}
```

## 🔄 Caching

The chat widget can cache the chat session and messages in the browser's local storage to maintain the conversation across page reloads.

To disable caching, set `cache: false` in the `options` object.

```javascript
const chat = new ChatBot({
  // ... other options
  options: {
    cache: false,
  }
});
```

## 🎨 Customization

### Colors

You can completely customize the widget's appearance:

```javascript
const chat = new ChatBot({
  // ... other options
  custom: {
    primaryColor: '#e74c3c',      // Primary color
    headerBgColor: '#2c3e50',     // Header background
    headerTextColor: '#ffffff',   // Header text
  }
});
```

### Texts

Customize the texts that appear in the widget:

```javascript
const chat = new ChatBot({
  // ... other options
  custom: {
    botName: 'My Personal Assistant',
    sendButtonText: 'Send Message'
  }
});
```

## 📁 Example Files

The SDK includes several example files for different use cases:

### Main Files

- **`example/text.html`**: Basic example with all functionalities
- **`example/streaming-test.html`**: Specific test for simulated streaming
- **`example/options-menu.html`**: Visual configurator with Bootstrap
- **`example/options-menu-tailwind.html`**: Visual configurator with Tailwind CSS
- **`example/registration-screen-example.html`**: Registration screen example
- **`index.html`**: 30 different configuration examples

### Tests

- **`tests/`**: Complete unit test suite
- **`tests/RegistrationScreen.test.js`**: Specific tests for registration screen
- **`tests/streaming.test.js`**: Tests for streaming functionality

## 🚀 Deployment

### Local Development

1. Clone the repository.
2. Open `example/streaming-test.html` to test streaming.
3. Open `example/text.html` to see all functionalities.
4. Modify the configuration according to your needs.

### Production

1. Include the script from CDN.
2. Configure your API endpoint.
3. Customize the appearance according to your brand.

## 🤝 Contributing

1. Fork the project.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is under the ISC License. See the `LICENSE` file for more details.

## 👨‍💻 Author

**Bemtorres**

- GitHub: [@bemtorres](https://github.com/bemtorres)

## 🙏 Acknowledgments

- [Bootstrap](https://getbootstrap.com/) for the CSS framework.
- [Cloudinary](https://cloudinary.com/) for default image hosting.
