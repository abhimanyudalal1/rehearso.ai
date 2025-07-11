const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

dotenv.config();

// const Authmiddleware = require("../Authentication/auth");
const GEMINI_KEY = process.env.GEMINI_API_KEY_1;

router.get('/finalsummary', async function (req, res) {
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

  try {
    const reportResponse = await axios.get('http://localhost:8000/get-reports');
    const sessionData = reportResponse.data;

    if (!sessionData || !Array.isArray(sessionData.stats)) {
      return res.status(400).json({ error: 'Invalid or missing session data' });
    }

    const prompt = generatePrompt(sessionData);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${prompt}`,
      config: {
        systemInstruction: "You are a coach. Analyze the performance stats and return a final summary highlighting progress, strengths, and motivational advice."
      },
    });

    console.log(response.text);

    res.status(200).json({
      summary: response.text
    });

  } catch (err) {
    console.error("Error generating final summary:", err);
    res.status(500).json({
      error: 'Failed to generate summary',
      summary: 'Could not generate summary at this time. Please try again later.'
    });
  }
});

function generatePrompt(data) {
  const {
    total_sessions,
    average_total_score,
    average_posture_score,
    average_gesture_score,
    average_speaking_score,
    maximum_total_score,
    stats
  } = data;

  const sessions = stats.map((s, i) => {
    return `Session ${i + 1} (${new Date(s.timestamp * 1000).toLocaleDateString()})
- Total Score: ${s.total_score}
- Posture: ${s.posture_score}
- Gesture: ${s.gesture_score}
- Speaking: ${s.speaking_score}`;
  }).join('\n');

  return `
Based on this user's session performance, write a final summary that reflects overall progress, strengths, improvement areas, and ends with motivation.

Stats:
- Total Sessions: ${total_sessions}
- Average Score: ${average_total_score}/100
- Max Score: ${maximum_total_score}/100
- Avg Posture: ${average_posture_score}
- Avg Gesture: ${average_gesture_score}
- Avg Speaking: ${average_speaking_score}

Sessions:
${sessions}
  `;
}

module.exports = router;
