from motor.motor_asyncio import AsyncIOMotorClient
import time



client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.speakai
col = db.reports

async def insert_report(report:str,posture_score,gesture_score,speaking_score,total_score):
    response = await col.insert_one({"report":report,"posture_score":posture_score,"gesture_score":gesture_score,"speaking_score":speaking_score,"total_score":total_score,"timestamp":time.time()})
    if response.inserted_id:
        return {"inserted":True}
    return {"inserted":False}

async def get_reports():
    reports = await col.find({}).sort("timestamp",-1).to_list(length=None)
    return {"reports":reports,"total_sessions":len(reports)}

