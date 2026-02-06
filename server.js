const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMINS = ["aeeryinx", "SQUELETTE050680"];
const MASTER_USER = "admin@celestial.dev";
const MASTER_PASS = "Celestial2026";

let activeCodes = {}; 
let verifiedStatus = {};
let maintenanceMode = false;

// Configuração de CORS super permissiva para evitar erros na Vercel
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

app.get('/ping', (req, res) => res.send("pong"));

app.get('/maintenance-status', (req, res) => {
    res.json({ enabled: maintenanceMode });
});

app.post('/proxy-search', async (req, res) => {
    const { username } = req.body;
    try {
        const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
            usernames: [username],
            excludeBannedUsers: true
        });
        res.json({ data: response.data.data || [] });
    } catch (error) {
        res.status(500).json({ error: "Roblox API Offline" });
    }
});

app.post('/set-maintenance', (req, res) => {
    const { enabled, admin, masterUser, masterPass } = req.body;
    if ((admin && ADMINS.some(a => a.toLowerCase() === admin.toLowerCase())) || 
        (masterUser === MASTER_USER && masterPass === MASTER_PASS)) {
        maintenanceMode = (enabled === true);
        return res.json({ success: true });
    }
    res.status(403).json({ error: "Unauthorized" });
});

app.post('/start-verification', (req, res) => {
    const { userId, code } = req.body;
    activeCodes[userId] = code; 
    verifiedStatus[userId] = false; 
    res.json({ success: true });
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

app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));