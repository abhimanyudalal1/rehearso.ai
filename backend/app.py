"""
Note (for Yashika and Divyansh): in the .env file put the 3 Gemini Api keys as follows (follow the exact structure):

GEMINI_API_KEY_1 =
GEMINI_API_KEY_2 =
GEMINI_API_KEY_3 =

"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
import time
import os
from key_manager import APIKeyManager
from dotenv import load_dotenv
load_dotenv()

# Use the API_KEY_1 as default, KeyManager handles rotation
# API_KEY = os.getenv("GOOGLE_API") # This variable is not used if you rely on KeyManager fully.

base_prompt = """
You are a speech specialist. Based on the text input you will receive, assess the speech based on grammar, fluency, and other public speaking skills such that the user can
learn how to improve their speech.
Keep your feedback concise, only 2-3 lines.
Here is the speech:
{text}
"""

prompt_template = ChatPromptTemplate.from_template(base_prompt)

key_manager = APIKeyManager()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

start_time = time.time()
class ConnectionManager:
    def __init__(self):
        self.active_connections = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    async def disconnect(self, websocket: WebSocket):
        try:
            self.active_connections.remove(websocket)
        except ValueError:
            pass
    async def send_text(self, text: str, websocket: WebSocket):
        await websocket.send_text(text)
manager = ConnectionManager()

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=key_manager.get_next_key()
    )

async def call_gemini(message):
    llm = get_llm()
    chain = prompt_template|llm|StrOutputParser()
    response = await chain.ainvoke({"text":message})
    return response

@app.websocket("/ws/audio")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            try:
                # Expecting interim or final transcripts from frontend
                data = await websocket.receive_text()
                # print(f"Received text: {data}") # Uncomment for debugging

                # Call Gemini for feedback
                res = await call_gemini(data)

                # print(f"Sending feedback: {res}") # Uncomment for debugging
                await manager.send_text(res, websocket)

            except WebSocketDisconnect:
                print(f"WebSocket disconnected: {websocket}")
                await manager.disconnect(websocket)
                break
            except Exception as e:
                print(f"Error in websocket_endpoint: {str(e)}")
                break
    finally:
        await manager.disconnect(websocket)

# Add a simple health check or root endpoint
@app.get("/")
async def read_root():
    return {"message": "SpeakAI FastAPI backend is running!"}