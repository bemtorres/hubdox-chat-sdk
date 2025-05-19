# Hubdox Chat SDK

A lightweight JavaScript SDK to easily integrate a customizable chat bot into your web projects.

## What is Hubdox Chat SDK?

This library allows you to quickly add a chat bot interface to your website or web app. The SDK provides a modern, responsive UI that includes:

- A floating chat button at the bottom-right corner.
- A popup modal chat window.
- Sending messages and receiving responses from a configurable API endpoint.
- Handling loading states, user and bot messages with avatars and timestamps.
- Option to embed the chat inline within any container or use it as a popup modal.

## Key Features

- **Vanilla JavaScript**: No external frameworks required.
- **Bootstrap 5 styling**: Uses Bootstrap CSS for a clean, responsive design.
- **Popup or Inline mode**: Choose whether chat opens in a modal or embeds inline.
- **Dynamic Bootstrap CSS injection**: Automatically loads Bootstrap CSS if not already present.
- **Simple message management**: Displays user and bot messages with timestamps and avatars.
- **Compatible with any REST API**: Sends JSON messages and displays received responses.

## Installation and Usage

## 
```cmd
npm i hubdox-chat-sdk
```
## 
```js
<script src="https://cdn.jsdelivr.net/npm/hubdox-chat-sdk@0.1.0"></script>
```

### Quick integration with script tag

```html
<script src="path/to/hubdox-chat-sdk.js"></script>

<script>
  const chat = new HubdoxChatSDK({
    apiCall: 'https://yourapi.com/chat',
    user: { name: 'Benjamin', photo: '/images/default-user.png' },
    bot: { name: 'Bot', img: '/images/bot-avatar.png' },
    mode: 'popup', // or 'inline'
    container: document.getElementById('chat-container') // required if mode is inline
  });
</script>
```