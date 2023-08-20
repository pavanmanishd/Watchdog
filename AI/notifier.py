import cx_Oracle
from datetime import datetime, timedelta
import time
import threading
import os
import cv2
import requests
import base64
import json

PREVIOUS_ENCOUNTER_CLEAR_TIME = 5 # in minutes

class Database:
    def __init__(self, username, password, host, port, service_name):
        while True:
            try:
                dsn = cx_Oracle.makedsn(host, port, service_name=service_name)
                self.connection = cx_Oracle.connect(username, password, dsn)
                print('[INFO] Connected to the database')
                break
            except Exception as e:
                print("[ERROR] Failed to connect to the database. Retrying in 5 seconds...")
                time.sleep(5)

    def get_unique_encounters(self, time_period_minutes):
        query = f"""
            SELECT e1.NAME, e1.CONFIDENCE, e1.TIMESTAMP, e1.IMAGE, e1.CAMERASOCKETURL, e1.LOCATION, e1.CAMERA_ID
            FROM encounters e1
            JOIN (
                SELECT NAME, MAX(TIMESTAMP) AS max_timestamp
                FROM encounters
                WHERE TO_DATE(TIMESTAMP, 'DD-MON-YYYY HH24:MI:SS') >= :start_time
                GROUP BY NAME
            ) e2 ON e1.NAME = e2.NAME AND e1.TIMESTAMP = e2.max_timestamp
        """
        start_time = datetime.now() - timedelta(minutes=time_period_minutes)
        with self.connection.cursor() as cursor:
            cursor.execute(query, start_time=start_time)
            results = cursor.fetchall()
        
        return results
    
    def get_other_persons(self, image)->list: 
        query = f"""
            SELECT NAME FROM encounters WHERE IMAGE = :image
        """
        with self.connection.cursor() as cursor:
            cursor.execute(query, image=image)
            results = cursor.fetchall()
        
        return results
    
    def get_person_details(self, name, image):
        query = f"""
            SELECT NAME, CONFIDENCE, TIMESTAMP, IMAGE, CAMERASOCKETURL, LOCATION, CAMERA_ID FROM encounters WHERE NAME = :name AND IMAGE = :image
        """
        with self.connection.cursor() as cursor:
            cursor.execute(query, name=name, image=image)
            results = cursor.fetchall()
        
        return results



def clear_encounters():
    global previous_encounters
    while True:
        time.sleep(PREVIOUS_ENCOUNTER_CLEAR_TIME * 60)
        print("[INFO] Clearing previous encounters")
        previous_encounters.clear()

def send_encounters(encounters_list):
    try:
        images = []
        for encounter in encounters_list.keys():
            other_persons = db.get_other_persons(encounter)
            print("Other criminals in the image:", other_persons)
            for other_person in other_persons:
                if other_person[0] not in previous_encounters.keys():
                    previous_encounters[other_person[0]] = [encounter, encounters_list[encounter]['criminals'][0]["camera_id"]]
                    encounters_list[encounter]['criminals'].append(db.get_person_details(other_person[0], encounter))
                else:
                    if previous_encounters[other_person[0]][1] != encounters_list[encounter]['criminals'][0]["camera_id"]:
                        previous_encounters[other_person[0]] = [encounter, encounter_list[encounter]['criminals'][0]["camera_id"]]
                        encounters_list[encounter]['criminals'].append(db.get_person_details(other_person[0], encounter))
            image = cv2.imread('encounters/' + encounter + '.jpg')
            image_data = cv2.imencode('.jpg', image)[1].tobytes()
            images.append(base64.b64encode(image_data).decode('utf-8'))

        for i, encounter in enumerate(encounters_list):
            encounters_list[encounter]['image'] = images[i]

        response = requests.post(server_url + "/notify", json=encounters_list)

        if response.status_code == 200:
            print("Encounters sent successfully")
            print(response.text)
        else:
            print("Failed to send encounters")
    except Exception as e:
        print('Exception occurred: ', e)

if __name__ == "__main__":
    server_details = json.load(open("config.json", "r"))['notify_server']
    server_ip, server_port = server_details["ip"], server_details["port"]
    server_url = f"http://{server_ip}:{server_port}"

    previous_encounters = dict()

    db = Database(username="aimlb4",
                  password="vishalsai",
                  host="localhost",
                  port="1521",
                  service_name="xe")

    time_period_minutes = 5 

    encounter_clearer_thread = threading.Thread(target=clear_encounters)
    encounter_clearer_thread.daemon = True
    encounter_clearer_thread.start()

    size = len(os.listdir("encounters"))
    column_names = ["name", "confidence", "timestamp", "image", "camerasocketurl", "location", "camera_id"]
    while True:
        new_size = len(os.listdir("encounters"))
        if new_size != size:
            size = new_size
            encounters = db.get_unique_encounters(time_period_minutes)
            encounter_list = dict()
            
            for encounter in encounters:
                encounter_details = dict(zip(column_names, encounter))
                if encounter_details["name"] not in previous_encounters.keys():
                    previous_encounters[encounter_details["name"]] = [encounter_details["image"], encounter_details["camera_id"]]
                    temp = dict()
                    temp['criminals'] = [encounter_details]
                    encounter_list[encounter_details['image']] = temp
                else:
                    if previous_encounters[encounter_details["name"]][1] != encounter_details["camera_id"]:
                        previous_encounters[encounter_details["name"]] = [encounter_details["image"], encounter_details["camera_id"]]
                        temp = dict()
                        temp['criminals'] = [encounter_details]
                        encounter_list[encounter_details['image']] = temp

            if len(encounter_list) > 0:
                print("Encounters:", encounter_list)
                print("Previous encounters:", previous_encounters)
                send_encounters(encounter_list)
        
        time.sleep(1)