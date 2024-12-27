const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;
app.use(bodyParser.json());



app.use(cors());

mongoose.connect("mongodb+srv://r8936033768:kUYN6HaQmVpgZifJ@cluster0.y5q2n.mongodb.net/FoodEntry")
    .then(() => console.log("DB Connected"))
    .catch((err) => {
        console.log("errr", err)

    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const foodEntrySchema = new mongoose.Schema({
    foodName: { type: String, required: true },
    calories: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

const FoodEntry = mongoose.model('FoodEntry', foodEntrySchema);
app.post('/api/food', async (req, res) => {
    const { foodName, calories } = req.body;
    const foodEntry = new FoodEntry({ foodName, calories });
    try {
        await foodEntry.save();
        res.status(201).json(foodEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/food', async (req, res) => {
    const { date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    try {
        const entries = await FoodEntry.find({ date: { $gte: startDate, $lt: endDate } });
        const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
        res.json({
            entries,
            totalCalories
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.delete('/api/food/:id', async (req, res) => {
    try {
        const entry = await FoodEntry.findByIdAndDelete(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
