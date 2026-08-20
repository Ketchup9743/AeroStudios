const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/chat', async (req, res) => {
    try {
        const { messageHistory } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "API key not configured on server" });
        }

        const contents = messageHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // New AQ keys require the endpoint without the key query param, using headers instead
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

        const apiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({ contents })
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Google API Error Details:", data);
            return res.status(500).json({ error: data.error?.message || "Gemini API rejected request" });
        }

        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        res.json({ reply: aiReply });

    } catch (error) {
        console.error("Server Route Error:", error);
        res.status(500).json({ error: "Could not connect to AI server" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
