from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import cv2
import os
import numpy as np
import json

app = FastAPI()

class Criminal(BaseModel):
    criminalName: str
    image: str  # Change back to str

@app.post("/add_criminal")
async def add_criminal(criminal: Criminal):
    try:
        criminal_name = criminal.criminalName
        image = criminal.image
        image = base64.b64decode(image)
        image = np.frombuffer(image, dtype=np.uint8)
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)

        if not os.path.exists("train_images/" + criminal_name):
            os.makedirs("train_images/" + criminal_name)
        
        cv2.imwrite("train_images/" + criminal_name + "/" + criminal_name + ".jpg", image)

        return {"message": "Criminal added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get('/get_cameras')
async def get_cameras():
    try:
        cameras = json.load(open("config.json", "r"))['cameras']
        return cameras
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))