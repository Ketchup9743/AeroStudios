const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(__dirname));
app.post('/api/chat', (req, res) => {
    res.json({ message: "Server connected! Replace this with Gemini logic." });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
