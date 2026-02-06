const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

let activeCodes = {}; 
let verifiedStatus = {};

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ status: "Celestial API Online", version: "1.0.0" });
});

app.post('/start-verification', (req, res) => {
    const { userId, code } = req.body;
    if (!userId || !code) {
        return res.status(400).json({ error: "Missing parameters" });
    }
    activeCodes[userId] = code; 
    verifiedStatus[userId] = false; 
    console.log(`[SITE] Code generated for ${userId}: ${code}`);
    res.json({ success: true });
});

app.post('/verify-game', (req, res) => {
    const { userId, codeInput } = req.body; 

    if (!userId || !codeInput) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    const expectedCode = activeCodes[userId];

    if (expectedCode && expectedCode === codeInput) {
        verifiedStatus[userId] = true; 
        delete activeCodes[userId];
        console.log(`[GAME] User ${userId} verified!`);
        res.json({ success: true, message: "Verified!" });
    } else {
        res.json({ success: false, message: "Invalid code or expired." });
    }
});

app.get('/check-status', (req, res) => {
    const { userId } = req.query;
    if (verifiedStatus[userId]) {
        res.json({ verified: true });
        delete verifiedStatus[userId]; 
    } else {
        res.json({ verified: false });
    }
});

app.get('/proxy-search', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ error: "No keyword provided" });

    try {
        const response = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${keyword}&limit=10`);
        res.json(response.data);
    } catch (error) { 
        console.error("Roblox Search Error:", error.message);
        res.status(500).json({ error: "Failed to fetch from Roblox" }); 
    }
});

app.get('/get-avatar', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "No userId provided" });

    try {
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        
        if (response.data.data && response.data.data.length > 0) {
            res.json({ imageUrl: response.data.data[0].imageUrl });
        } else {
            res.status(404).json({ error: "No image found" });
        }
    } catch (error) {
        console.error("Avatar Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch avatar" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});