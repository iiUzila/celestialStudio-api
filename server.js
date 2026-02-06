const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMINS = ["aeeryinx", "SQUELETTE050680"];

let activeCodes = {}; 
let verifiedStatus = {};
let maintenanceMode = false;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ status: "Celestial API Online", maintenance: maintenanceMode });
});

app.get('/maintenance-status', (req, res) => {
    res.json({ enabled: maintenanceMode });
});

app.post('/set-maintenance', (req, res) => {
    const { enabled, admin } = req.body;
    
    // Log para debug no Render
    console.log(`[REQUEST] Toggle Maintenance: ${enabled} by ${admin}`);

    if (!admin || !ADMINS.some(a => a.toLowerCase() === admin.toLowerCase())) {
        console.log(`[DENIED] User ${admin} is not in admin list.`);
        return res.status(403).json({ error: "Unauthorized" });
    }

    maintenanceMode = (enabled === true); 
    console.log(`[SUCCESS] Maintenance is now: ${maintenanceMode}`);
    res.json({ success: true, enabled: maintenanceMode });
});

app.post('/start-verification', (req, res) => {
    const { userId, code } = req.body;
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
        const response = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${keyword}&limit=10`);
        res.json(response.data);
    } catch (e) { res.status(500).send(); }
});

app.listen(PORT, () => {
    console.log(`Celestial Server running on port ${PORT}`);
});