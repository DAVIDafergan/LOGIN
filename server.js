import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// חיבור למונגו
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB error:', err));

// סכמה
const FormSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const FormSubmission = mongoose.model('Submission', FormSchema);

// --- ה-API שלנו ---

app.post('/api/submit', async (req, res) => {
  try {
    const newSubmission = new FormSubmission(req.body);
    await newSubmission.save();
    console.log("✅ New submission saved!");
    res.json({ message: "Saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving" });
  }
});

app.get('/api/all-forms', async (req, res) => {
  try {
    const allForms = await FormSubmission.find().sort({ createdAt: -1 });
    res.json(allForms);
  } catch (error) {
    res.status(500).json({ error: "Error fetching" });
  }
});

// --- החלק החדש: הגשת האתר (React) ---
// השרת מגיש את הקבצים מתיקיית dist שנוצרת בבנייה
app.use(express.static(path.join(__dirname, 'dist')));

// *** התיקון נמצא כאן: שינוי מ- '*' ל- '(.*)' עבור Express 5 ***
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});