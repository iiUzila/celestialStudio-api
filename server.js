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

const allowedOrigins = [
    'https://celestial-studios.vercel.app',
    'http://127.0.0.1:5500',
    'http://localhost:5500'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS blocked'), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ status: "Celestial API Online", maintenance: maintenanceMode });
});

app.get('/maintenance-status', (req, res) => {
    res.json({ enabled: maintenanceMode });
});

app.post('/set-maintenance', (req, res) => {
    const { enabled, admin, masterUser, masterPass } = req.body;
    const isRobloxAdmin = admin && ADMINS.some(a => a.toLowerCase() === admin.toLowerCase());
    const isMasterLogin = (masterUser === MASTER_USER && masterPass === MASTER_PASS);

    if (isRobloxAdmin || isMasterLogin) {
        maintenanceMode = (enabled === true);
        return res.json({ success: true, enabled: maintenanceMode });
    }
    res.status(403).json({ error: "Unauthorized access" });
});

app.post('/start-verification', (req, res) => {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ error: "Missing data" });
    activeCodes[userId] = code; 
    verifiedStatus[userId] = false; 
    res.json({ success: true });
});

app.post('/verify-game', (req, res) => {
    const { userId, codeInput } = req.body; 
    const expectedCode = activeCodes[userId];
    if (expectedCode && expectedCode === codeInput) {
        verifiedStatus[userId] = true; 
        delete activeCodes[userId];
        res.json({ success: true });
    } else {
        res.json({ success: false });
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
    try {
        const response = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${keyword}&limit=1`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});

app.get('/get-avatar', async (req, res) => {
    const { userId } = req.query;
    try {
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Avatar failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});