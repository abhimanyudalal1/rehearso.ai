const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// const model = genAI.getGenerativeModel({
//   model: "gemini-pro",
//   generationConfig: {
//     temperature: 0.7,
//     maxOutputTokens: 1024,
//   },
// });

// const model = genAI.getGenerativeModel({ model: "models/text-bison-001" });

// const { GoogleGenerativeAI } = require('@google/generative-ai');

// // Final Summary Route
// const express = require('express');
// const router = express.Router();
// const axios = require('axios');

// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';


const API_KEY = process.env.GEMINI_API_KEY_2;

// Final Summary Route
// Final Summary Route
router.get('/finalsummary', async (req, res) => {
  try {
    const reportsResponse = await axios.get('http://localhost:8000/get-reports');

    if (!reportsResponse.data || !Array.isArray(reportsResponse.data.stats)) {
      return res.status(400).json({ error: 'No session data available' });
    }

    const sessionData = reportsResponse.data;
    const analysisPrompt = createAnalysisPrompt(sessionData);

    const geminiResponse = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: analysisPrompt }]
          }
        ]
      }
    );

    const summary = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned";

    res.json({
      success: true,
      summary,
      sessionCount: sessionData.total_sessions,
      dataAnalyzed: sessionData.stats.length
    });

  } catch (error) {
    console.error('Error generating final summary:', error?.response?.data || error.message || error);
    res.status(500).json({
      error: 'Failed to generate summary',
      summary: 'Unable to generate detailed analysis at this time. Please try again later.',
      fallback: true
    });
  }
});

// ==========================
// Helper Functions
// ==========================

function createAnalysisPrompt(sessionData) {
  const { stats, total_sessions, average_total_score, average_posture_score, average_gesture_score, average_speaking_score, maximum_total_score } = sessionData;

  const sortedSessions = stats.sort((a, b) => a.timestamp - b.timestamp);
  const improvementTrend = calculateImprovementTrend(sortedSessions);
  const strengths = identifyStrengths(sessionData);
  const weaknesses = identifyWeaknesses(sessionData);

  return `
You are an expert public speaking coach analyzing a user's presentation performance data. Please provide a comprehensive, personalized analysis report based on the following session data:

**OVERALL STATISTICS:**
- Total Sessions Completed: ${total_sessions}
- Average Overall Score: ${average_total_score.toFixed(1)}/100
- Best Performance Score: ${maximum_total_score.toFixed(1)}/100
- Average Posture Score: ${average_posture_score.toFixed(1)}/100
- Average Gesture Score: ${average_gesture_score.toFixed(1)}/100
- Average Speaking Score: ${average_speaking_score.toFixed(1)}/100

**INDIVIDUAL SESSION BREAKDOWN:**
${sortedSessions.map((session, index) => `
Session ${index + 1} (${new Date(session.timestamp * 1000).toLocaleDateString()}):
- Overall Score: ${session.total_score.toFixed(1)}/100
- Posture: ${session.posture_score.toFixed(1)}/100
- Gestures: ${session.gesture_score.toFixed(1)}/100
- Speaking: ${session.speaking_score.toFixed(1)}/100
- Detailed Report: ${session.report}
`).join('')}

**PERFORMANCE TRENDS:**
${improvementTrend}

**IDENTIFIED STRENGTHS:**
${strengths.join(', ')}

**AREAS FOR IMPROVEMENT:**
${weaknesses.join(', ')}

Please provide a detailed analysis that includes:
1. Performance Overview
2. Strengths Analysis
3. Improvement Areas
4. Progress Trends
5. Personalized Recommendations
6. Motivation & Encouragement
`;
}

function calculateImprovementTrend(sortedSessions) {
  if (sortedSessions.length < 2) return "Insufficient data to determine trend";

  const first = sortedSessions[0];
  const last = sortedSessions[sortedSessions.length - 1];
  const overallImprovement = ((last.total_score - first.total_score) / first.total_score * 100).toFixed(1);

  const recentAvg = sortedSessions.slice(-3).reduce((sum, s) => sum + s.total_score, 0) / Math.min(3, sortedSessions.length);
  const earlyAvg = sortedSessions.slice(0, 3).reduce((sum, s) => sum + s.total_score, 0) / Math.min(3, sortedSessions.length);

  if (overallImprovement > 5) return `Strong upward trend with ${overallImprovement}% improvement. Recent avg: ${recentAvg.toFixed(1)}, Early avg: ${earlyAvg.toFixed(1)}`;
  if (overallImprovement > 0) return `Mild improvement of ${overallImprovement}%. Recent avg: ${recentAvg.toFixed(1)}, Early avg: ${earlyAvg.toFixed(1)}`;
  if (overallImprovement > -5) return `Stable performance (±5%). Recent avg: ${recentAvg.toFixed(1)}, Early avg: ${earlyAvg.toFixed(1)}`;
  return `Downward trend of ${Math.abs(overallImprovement)}%. Needs review. Recent avg: ${recentAvg.toFixed(1)}, Early avg: ${earlyAvg.toFixed(1)}`;
}

function identifyStrengths(data) {
  const strengths = [];
  const { average_posture_score, average_gesture_score, average_speaking_score, average_total_score } = data;

  if (average_posture_score >= 80) strengths.push("Excellent posture control");
  else if (average_posture_score >= 70) strengths.push("Good posture awareness");

  if (average_gesture_score >= 80) strengths.push("Strong gesture usage");
  else if (average_gesture_score >= 70) strengths.push("Effective body language");

  if (average_speaking_score >= 80) strengths.push("Confident speaking delivery");
  else if (average_speaking_score >= 70) strengths.push("Clear communication skills");

  if (average_total_score >= 85) strengths.push("Consistently high performance");
  else if (average_total_score >= 75) strengths.push("Solid overall presentation skills");

  return strengths.length ? strengths : ["Showing commitment to improvement"];
}

function identifyWeaknesses(data) {
  const weaknesses = [];
  const scores = [
    { name: "posture", score: data.average_posture_score },
    { name: "gestures", score: data.average_gesture_score },
    { name: "speaking", score: data.average_speaking_score }
  ];

  scores.sort((a, b) => a.score - b.score);

  if (scores[0].score < 60) weaknesses.push(`${scores[0].name} needs significant attention`);
  else if (scores[0].score < 70) weaknesses.push(`${scores[0].name} has room for improvement`);

  if (scores[1].score < 65) weaknesses.push(`${scores[1].name} could be strengthened`);

  return weaknesses.length ? weaknesses : ["Minor refinements in presentation delivery"];
}

module.exports = router;