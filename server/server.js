// 📦 Import packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const syncRoutes = require('./routes/syncRoutes');
const syncGmailJobs = require('./gmailSync');
require('dotenv').config();

// 🚀 Create app
const app = express();
const PORT = process.env.PORT || 5000;

// 🔌 Middleware
app.use(cors());
app.use(express.json());
app.use('/api/sync', syncRoutes);

// 🔗 MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Wooohoooo MongoDB connected"))
.catch((err) => console.error("Ohh shittt MongoDB connection failed:", err));

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => res.send('Backend running!'));

app.get('/oauth/callback', (req, res) => {
  const { code } = req.query;
  res.send(`
    <h2>Authorization Code:</h2>
    <p style="background:#f0f0f0;padding:10px;font-family:monospace;word-break:break-all;">${code}</p>
    <p>Copy this code and paste it in your terminal</p>
  `);
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));

app.post('/api/sync', async (req, res) => {
  try {
    const result = await syncGmailJobs();
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});