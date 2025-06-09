const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));
app.use(express.json());

// Middleware för att logga inkommande förfrågningar
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API-statusendpoint för att kontrollera att servern är igång
app.get('/api/status', (req, res) => {
  console.log('Status endpoint accessed');
  res.status(200).json({ status: 'OK', serverTime: new Date().toISOString() });
});

// Hantera 404 - sidan hittades inte
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, error: 'Resursen hittades inte' });
});

// Felhantering middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Serverfel' });
});

// Starta servern
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API-server startat utan email-funktionalitet - använder endast push-notiser');
});