import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// חיבור למונגו
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB error:', err));

// יצירת מודל גמיש (שומר כל שדה שהטופס שולח)
const FormSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const FormSubmission = mongoose.model('Submission', FormSchema);

// 1. נתיב לשליחת טופס (עבור המשתמשים)
app.post('/api/submit', async (req, res) => {
  try {
    const newSubmission = new FormSubmission(req.body);
    await newSubmission.save();
    console.log("New form received!");
    res.json({ message: "נשלח בהצלחה!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "תקלה בשמירה" });
  }
});

// 2. נתיב למשיכת כל הטפסים (עבור המנהל בלבד)
app.get('/api/all-forms', async (req, res) => {
  try {
    // מביא את הכל, מהחדש לישן
    const allForms = await FormSubmission.find().sort({ createdAt: -1 });
    res.json(allForms);
  } catch (error) {
    res.status(500).json({ error: "תקלה בטעינת נתונים" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});