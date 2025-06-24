# 🎤 Speak AI – Public Speaking Practice Platform

**Speak AI** is an AI-powered web platform that helps users improve their public speaking skills through solo and group sessions. It provides real-time coaching, AI analysis, peer evaluation, and post-session feedback focused on voice clarity, confidence, gestures, and body language.

---

## 🧩 The Problem We're Solving

Public speaking isn’t just uncomfortable—it’s terrifying. Studies show that **77% of people fear public speaking more than death itself**. Yet, despite this widespread fear, there’s a lack of intelligent, affordable, and accessible tools that provide **personalized and real-time** feedback. Traditional coaching is generic, expensive, and not scalable. That’s where **Speak AI** steps in.

---

## 💡 Our Solution: Speak AI

An AI-powered platform combining speech recognition, computer vision, and NLP to provide meaningful public speaking practice experiences.

### 🔹 Solo Practice Mode – ✅ Fully Functional

- AI-generated topics with 1-minute preparation time
- Real-time visual coaching cues (e.g., "Avoid fillers", "Maintain eye contact")
- Live video feedback on posture, confidence, gestures
- Post-session analytics with improvement suggestions  
🟢 **This mode is live and shown through `index.html`**

### 🔹 Group Discussion Mode – 🚧 In Development

- Virtual practice rooms with structured speaking turns
- Peer feedback and scoring
- Leaderboards and collaborative growth  
🛠️ **Integration and backend 80% complete – launching soon!**

---

## 🛠️ Tech Stack

### 🔹 Frontend
- Next.js (React)
- Tailwind CSS
- Lucide Icons
- ShadCN UI
- Animate.css

### 🔹 Backend
- Node.js & Express.js
- MongoDB + Mongoose
- JWT Authentication

### 🔹 AI/ML Integration
- Google Gemini API
- Streamlit + Librosa + OpenCV for speech & facial analysis

---

## 📂 Folder Structure

public-speaking/
├── frontend/
│ ├── app/
│ ├── components/
│ ├── lib/
│ └── pages/
├── backend/
│ ├── models/
│ ├── routes/
│ ├── server.js
│ └── streamlit_app.py
└── index.html

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/public-speaking.git
cd public-speaking
2. Install Dependencies
Frontend


cd frontend
npm install
Backend


cd ../backend
npm install
3. Add Environment Variables
Create a .env file in backend/:


MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY_1=your_gemini_key
GEMINI_API_KEY_2=your_gemini_key
GEMINI_API_KEY_3=your_gemini_key
4. Start the Servers
Backend

cd backend
node server.js
Frontend


cd frontend
npm run dev
