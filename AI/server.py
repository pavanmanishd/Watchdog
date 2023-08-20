import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import cv2
import os
import numpy as np
import json
import logging

server_details = json.load(open("config.json", "r"))['server']
server_ip, server_port = server_details["ip"], server_details["port"]

# logging.basicConfig(filename='model.log', format='%(asctime)s %(levelname)s:%(message)s', datefmt='%m/%d/%Y %I:%M:%S %p', level=logging.DEBUG, encoding='utf-8')
logging.basicConfig(
    filename = 'model.log',
    # encoding = 'utf-8',
    format='%(asctime)s,%(msecs)03d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s',
    datefmt='%Y-%m-%d:%H:%M:%S',
    level=logging.DEBUG)

app = FastAPI()

class Criminal(BaseModel):
    criminalName: str
    image: str

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

        print('[INFO] ',criminal_name, "added to known faces list")
        logging.info("%s added to known faces list", criminal_name)
        return {"message": "Criminal added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get('/get_cameras')
async def get_cameras():
    try:
        cameras = json.load(open("config.json", "r"))['cameras']
        print('[INFO] Cameras retrieved successfully')
        logging.info("Cameras retrieved successfully")
        return cameras
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

if __name__ == "__main__":
    uvicorn.run(app, host=server_ip, port=server_port)