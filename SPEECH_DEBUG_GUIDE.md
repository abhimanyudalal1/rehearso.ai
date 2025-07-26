# Speech Recognition & Live Analysis Debugging Guide

## ✅ Current Status
- **Backend**: Running correctly on port 8000
- **Frontend**: Running correctly on port 3001 
- **WebSocket Connection**: Working properly (`/ws/audio`)
- **Gemini Analysis**: Working correctly (verified with test script)
- **Streamlit**: Starting correctly when rooms are created

## 🔧 Verified Working Components

### 1. Backend WebSocket Handler
- ✅ Receives text via WebSocket
- ✅ Calls Gemini API for analysis
- ✅ Returns analysis response
- ✅ Detailed logging shows all steps working

### 2. Gemini API Integration
- ✅ API keys are correctly configured
- ✅ Analysis returns meaningful feedback
- ✅ Example response: "Your speech has a strong opening, clearly stating the topic and purpose..."

### 3. WebSocket Connection
- ✅ Test script successfully connects and sends/receives data
- ✅ Backend logs show proper connection handling

## 🎯 Live Speech Analysis Setup

### For Solo Practice (`/practice/solo`)
The page automatically:
1. Starts camera and MediaPipe analysis
2. Connects to WebSocket at `ws://127.0.0.1:8000/ws/audio`
3. Begins speech recognition
4. Sends transcribed text to Gemini for analysis
5. Displays analysis in the status area

### For Group Practice (`/practice/group`)
1. Create or join a room (this starts Streamlit)
2. Begin session to start live analysis

## 🚨 Troubleshooting Steps

### 1. Check Browser Permissions
- **Microphone Access**: The browser MUST grant microphone permissions
- Look for microphone icon in browser address bar
- If blocked, click and allow microphone access

### 2. Browser Compatibility
- **Chrome/Edge**: Full support for Web Speech API
- **Firefox**: Limited support
- **Safari**: May require different configuration

### 3. HTTPS Requirements
- Some browsers require HTTPS for microphone access
- If testing locally, try:
  - Chrome with `--allow-insecure-localhost` flag
  - Or access via `https://localhost:3001` (may need SSL setup)

### 4. Check Console for Errors
Open browser Developer Tools (F12) and check for:
- Speech recognition errors
- WebSocket connection errors
- Permission denied errors

## 🧪 Manual Testing Steps

### Test 1: WebSocket Connection
Run in terminal:
```bash
cd /Users/abhimanyu/Desktop/public-speaking
python test_websocket.py
```
Expected: Should receive Gemini analysis

### Test 2: Speech Recognition Test Page
Open: `file:///Users/abhimanyu/Desktop/public-speaking/test_speech.html`
1. Click "Start Speech Recognition"
2. Allow microphone access when prompted
3. Speak clearly
4. Check if transcript appears
5. Check if Gemini analysis appears

### Test 3: Solo Practice Page
1. Navigate to `http://localhost:3001/practice/solo`
2. Go through setup steps
3. Start speaking session
4. Grant microphone permissions
5. Speak clearly and check for live feedback

## 🔍 Common Issues & Solutions

### Issue: "Microphone permission denied"
**Solution**: Click the microphone icon in browser address bar and allow access

### Issue: "Speech recognition not supported"
**Solution**: Use Chrome or Edge browser

### Issue: "WebSocket connection failed"
**Solution**: Ensure backend is running on port 8000

### Issue: No speech detected
**Solution**: 
- Speak more clearly and loudly
- Check microphone is working in other apps
- Try different browser

### Issue: Analysis not appearing
**Solution**:
- Check browser console for errors
- Verify WebSocket connection in Network tab
- Ensure backend logs show received messages

## 📊 Expected Behavior

When working correctly:
1. **Status shows**: "Connected! Speak naturally."
2. **Backend logs show**: WebSocket connections and received text
3. **Live feedback appears**: Real-time Gemini analysis of speech
4. **MediaPipe analysis**: Posture and gesture feedback

## 🎯 Next Steps

If speech recognition still doesn't work:
1. Try the test page first to isolate the issue
2. Check browser permissions carefully
3. Try a different browser (Chrome recommended)
4. Check if HTTPS is required for your browser version
