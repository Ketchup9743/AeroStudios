const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatContainer = document.querySelector('.chat-container');
const uploadBtn = document.getElementById('uploadBtn');
const imageInput = document.getElementById('imageInput');

let messageHistory = [];

uploadBtn.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        console.log('File selected:', file.name);
        uploadBtn.style.color = 'var(--accent-blue)';
    }
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;

    userInput.value = '';
    setFormState(false);

    appendMessage('user', message);
    messageHistory.push({ role: 'user', content: message });

    // Instantly force the input bar to the bottom on the first message
    if (!chatContainer.classList.contains('chat-started')) {
        chatContainer.classList.add('chat-started');
    }

    const thinkingId = appendMessage('ai', 'Thinking...');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageHistory }),
        });

        const data = await response.json();

        removeMessage(thinkingId);

        if (!response.ok) throw new Error(data.error);

        appendMessage('ai', data.reply);
        messageHistory.push({ role: 'assistant', content: data.reply });

    } catch (error) {
        console.error('Error:', error);
        removeMessage(thinkingId);
        appendMessage('ai', `Sorry, I ran into an error: ${error.message}`);
    } finally {
        setFormState(true);
        userInput.focus();
    }
});

function appendMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    const messageId = Date.now();
    messageDiv.dataset.id = messageId;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? 'Y' : 'AI';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageId;
}

function removeMessage(id) {
    const messageElement = document.querySelector(`[data-id="${id}"]`);
    if (messageElement) {
        chatMessages.removeChild(messageElement);
    }
}

function setFormState(enabled) {
    const sendBtn = chatForm.querySelector('button[type="submit"]');
    
    userInput.disabled = !enabled;
    sendBtn.disabled = !enabled;
    uploadBtn.disabled = !enabled;
    
    if (enabled) {
        userInput.focus();
    }
}
