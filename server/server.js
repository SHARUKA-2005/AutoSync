// 📦 Import packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const syncRoutes = require('./routes/syncRoutes');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const syncGmailJobs = require('./gmailSync');
require('dotenv').config();

// 🚀 Create app
const app = express();
const PORT = process.env.PORT || 5000;

// 🔌 Middleware
app.use(cors({origin:"*",}));
app.use(express.json());

// 🔗 Routes
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// 🔗 MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection failed:", err));

app.get('/', (req, res) => res.send('Backend running!'));

app.post('/api/sync', async (req, res) => {
  try {
    const result = await syncGmailJobs();
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0" ,  () => console.log(`🚀 Server running on port ${PORT}`));