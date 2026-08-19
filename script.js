const conversationHistory = [
  { role: 'assistant', content: 'Hello! How can I assist you with Aero Studios today?' }
];
document.getElementById('chatForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const input = document.getElementById('userInput');
  const userMessage = input.value.trim();
  if (!userMessage) return;
  const chatMessages = document.getElementById('chatMessages');
  appendMessage('You', userMessage, 'user-message');
  input.value = '';
  conversationHistory.push({ role: 'user', content: userMessage });
  const typingIndicator = appendMessage('AI', 'Thinking...', 'ai-message thinking');
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageHistory: conversationHistory })
    });
    const data = await response.json();
    if (data.reply) {
      typingIndicator.querySelector('.message-content').innerText = data.reply;
      conversationHistory.push({ role: 'assistant', content: data.reply });
    } else {
      throw new Error(data.error || 'Invalid response from server');
    }
  } catch (error) {
    console.error(error);
    typingIndicator.querySelector('.message-content').innerText = 
      'Sorry, something went wrong connecting to the AI server.';
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
function appendMessage(sender, text, className) {
  const chatMessages = document.getElementById('chatMessages');
  const msgElement = document.createElement('div');
  msgElement.className = `message ${className}`;
  msgElement.innerHTML = `
    <div class="avatar">${sender}</div>
    <div class="message-content">${escapeHTML(text)}</div>
  `;
  chatMessages.appendChild(msgElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgElement;
}
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}