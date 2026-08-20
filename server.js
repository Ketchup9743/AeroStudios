const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("Full AI Error:", error);
        res.status(500).json({ error: "Could not connect to AI" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
