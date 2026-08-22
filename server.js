const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/requests.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'requests.html'));
});

app.get('/requests', (req, res) => {
  res.sendFile(path.join(__dirname, 'requests.html'));
});

app.get('/support.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'support.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'support.html'));
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ reply: 'Gemini API key not configured on server.' });
  }

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    
    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with Gemini API:', error);
    res.status(500).json({ reply: 'Error communicating with AI service.' });
  }
});

app.post('/api/request', async (req, res) => {
  const { discordUser, email, projectTitle, description } = req.body;
  
  if (!process.env.DISCORD_WEBHOOK_URL) {
    return res.status(500).json({ error: 'Webhook URL not configured' });
  }

  try {
    const discordPayload = {
      content: `🔔 **New Project Request Received!**`,
      embeds: [{
        title: projectTitle,
        color: 3092790,
        fields: [
          { name: 'Discord User', value: discordUser, inline: true },
          { name: 'Email', value: email, inline: true },
          { name: 'Description', value: description, inline: false }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    const discordRes = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    if (discordRes.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to post to Discord' });
    }
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
