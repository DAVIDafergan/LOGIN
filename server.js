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

// --- בדיקת משתנים ---
const uri = process.env.MONGO_URI;
console.log("---------------------------------------------------");
console.log("🔍 DIAGNOSTIC MODE STARTING...");
if (!uri) {
  console.error("❌ CRITICAL ERROR: MONGO_URI variable is MISSING!");
} else {
  // מדפיס רק את ההתחלה כדי לא לחשוף סיסמה, אבל לוודא שיש ערך
  console.log("✅ MONGO_URI found. Starts with:", uri.substring(0, 20) + "...");
}

// --- הגדרות חיבור למונגו ---
// מבטל את ה-Buffering כדי לקבל שגיאה מיידית אם אין חיבור
mongoose.set('bufferCommands', false); 

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000 // זמן המתנה מקוצר (5 שניות) כדי לראות שגיאות מהר
})
.then(() => console.log('✅ MongoDB Connected Successfully!'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('🔍 Full Error Details:', err);
});

// האזנה לאירועי חיבור
mongoose.connection.on('connected', () => console.log('ℹ️ Mongoose event: connected'));
mongoose.connection.on('error', (err) => console.log('ℹ️ Mongoose event: error', err));
mongoose.connection.on('disconnected', () => console.log('ℹ️ Mongoose event: disconnected'));

// --- סכמה ומודל ---
const FormSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const FormSubmission = mongoose.model('Submission', FormSchema);

// --- API ---
app.post('/api/submit', async (req, res) => {
  console.log("📥 Received form submission...");
  
  if (mongoose.connection.readyState !== 1) {
    console.error("❌ Database not ready. State:", mongoose.connection.readyState);
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const newSubmission = new FormSubmission(req.body);
    await newSubmission.save();
    console.log("✅ Data saved to DB!");
    res.json({ message: "Saved" });
  } catch (error) {
    console.error("❌ Error saving data:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/all-forms', async (req, res) => {
  try {
    const allForms = await FormSubmission.find().sort({ createdAt: -1 });
    res.json(allForms);
  } catch (error) {
    console.error("Fetching error:", error);
    res.status(500).json({ error: "Error fetching" });
  }
});

// --- נתיב בדיקת סיסמת מנהל ---
app.post('/api/admin-login', (req, res) => {
  const { code } = req.body;
  
  // בדיקה מול המשתנה המאובטח בשרת
  if (code === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "סיסמה שגויה" });
  }
    
});
// --- הגשת האתר ---
app.use(express.static(path.join(__dirname, 'dist')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});