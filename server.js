const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ status: "Online", message: "Celestial Studios API Running" });
});

app.get('/proxy-search', async (req, res) => {
    const { keyword } = req.query;
    
    if (!keyword) {
        return res.status(400).json({ error: "Keyword is required" });
    }

    try {
        const response = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${keyword}&limit=10`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from Roblox" });
    }
});

app.post('/start', (req, res) => {
    const { code } = req.body;
    console.log(`Novo processo de verificação iniciado. Código: ${code}`);
    res.json({ success: true, message: "Code registered" });
});

app.post('/roblox-verify', async (req, res) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    try {
        const response = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        const bio = response.data.description || "";

        if (bio.includes(code)) {
            return res.json({ 
                success: true, 
                message: "Verified", 
                user: {
                    id: response.data.id,
                    username: response.data.name,
                    displayName: response.data.displayName
                }
            });
        } else {
            return res.status(400).json({ success: false, message: "Code not found in bio" });
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to check bio" });
    }
});

app.get('/get-avatar', async (req, res) => {
    const { userId } = req.query;
    try {
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (response.data.data && response.data.data.length > 0) {
            res.json({ imageUrl: response.data.data[0].imageUrl });
        } else {
            res.status(404).json({ error: "Avatar not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch avatar" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});