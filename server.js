const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/chat', async (req, res) => {
    try {
        const { messageHistory } = req.body;
        
        const formattedHistory = messageHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const latestMessage = formattedHistory.pop();
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({ history: formattedHistory });
        
        const result = await chat.sendMessage(latestMessage.parts[0].text);
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error("Full AI Error:", error);
        res.status(500).json({ error: "Could not connect to AI" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
