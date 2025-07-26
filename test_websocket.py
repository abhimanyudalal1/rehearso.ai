#!/usr/bin/env python3
import asyncio
import websockets
import json

async def test_gemini_websocket():
    uri = "ws://localhost:8000/ws/audio"
    
    try:
        async with websockets.connect(uri) as websocket:
            # Send test speech text
            test_text = "Hello everyone, welcome to my presentation about artificial intelligence. Today I will be discussing the future of machine learning and its impact on society."
            
            print(f"Sending text: {test_text}")
            await websocket.send(test_text)
            
            # Wait for Gemini response
            response = await websocket.recv()
            print(f"Received Gemini analysis: {response}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini_websocket())
