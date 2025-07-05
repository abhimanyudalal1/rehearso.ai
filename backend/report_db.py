from motor.motor_asyncio import AsyncIOMotorClient
import time
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get MongoDB URI from environment, fallback to localhost if not set
MONGOOSE_URI = os.environ.get("MONGOOSE_URI")

client = AsyncIOMotorClient(MONGOOSE_URI)
db = client.speakai
col = db.reports

async def insert_report(report:str,posture_score,gesture_score,speaking_score,total_score):
    response = await col.insert_one({"report":report,"posture_score":posture_score,"gesture_score":gesture_score,"speaking_score":speaking_score,"total_score":total_score,"timestamp":time.time()})
    if response.inserted_id:
        return {"inserted":True}
    return {"inserted":False}

async def get_stats():
    stats = await col.find({}).sort("timestamp",-1).to_list(length=None)
    
    for stat in stats:
        if "_id" in stat:
            stat["_id"] = str(stat["_id"])
    
    total_scores = [stat.get("total_score", 0) for stat in stats if stat.get("total_score") is not None]
    posture_scores = [stat.get("posture_score", 0) for stat in stats if stat.get("posture_score") is not None]
    gesture_scores = [stat.get("gesture_score", 0) for stat in stats if stat.get("gesture_score") is not None]
    speaking_scores = [stat.get("speaking_score", 0) for stat in stats if stat.get("speaking_score") is not None]
    
    average_total_score = sum(total_scores) / len(total_scores) if total_scores else 0
    average_posture_score = sum(posture_scores) / len(posture_scores) if posture_scores else 0
    average_gesture_score = sum(gesture_scores) / len(gesture_scores) if gesture_scores else 0
    average_speaking_score = sum(speaking_scores) / len(speaking_scores) if speaking_scores else 0
    maximum_total_score = max(total_scores) if total_scores else 0
    
    return {
        "stats": stats,
        "total_sessions": len(stats),
        "average_total_score": round(average_total_score, 1),
        "average_posture_score": round(average_posture_score, 1),
        "average_gesture_score": round(average_gesture_score, 1),
        "average_speaking_score": round(average_speaking_score, 1),
        "maximum_total_score": maximum_total_score
    }

