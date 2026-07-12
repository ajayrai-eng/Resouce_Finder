const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Database Connection
mongoose.connect('mongodb://localhost:27017/resourceFinder')
    .then(() => console.log("✅ Database Linked: Ready to track resources!"))
    .catch(err => console.error("❌ Connection failed", err));

// 2. Schema (Added soldOut field)
const resourceSchema = new mongoose.Schema({
    item: String,
    shop: String,
    location: String,
    votes: {
        correct: { type: Number, default: 1 },
        fake: { type: Number, default: 0 },
        soldOut: { type: Number, default: 0 }
    }
});
const Resource = mongoose.model('Resource', resourceSchema);

// 3. Search API (Filters out Fake entries)
app.get('/api/search', async (req, res) => {
    try {
        const q = req.query.q;
        // Logic: Agar fake reports 5 ya usse zyada hain, toh results mein mat dikhao
        const results = await Resource.find({ 
            item: new RegExp(q, 'i'),
            'votes.fake': { $lt: 5 } 
        });
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// 4. Add Resource API
app.post('/api/add', async (req, res) => {
    try {
        const data = new Resource({
            ...req.body,
            votes: { correct: 1, fake: 0, soldOut: 0 }
        });
        await data.save();
        res.json({ message: "Saved Successfully!" });
    } catch (err) {
        res.status(500).send(err);
    }
});

// 5. Verify API (Correct, Fake, and SoldOut handles)
app.post('/api/verify', async (req, res) => {
    const { id, type } = req.body; 
    let updateField = {};
    
    if (type === 'fake') updateField = { 'votes.fake': 1 };
    else if (type === 'soldOut') updateField = { 'votes.soldOut': 1 };
    else updateField = { 'votes.correct': 1 };

    await Resource.findByIdAndUpdate(id, { $inc: updateField });
    res.send({ message: "Vote Recorded" });
});

app.listen(3000, () => console.log("🚀 Server is running on http://localhost:3000"));