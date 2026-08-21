const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Request submission endpoint using native Node.js fetch
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
        color: 3092790, // Blue accent
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
