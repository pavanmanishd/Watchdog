import cx_Oracle
from datetime import datetime, timedelta
import time
import json
import threading
import os
import cv2
import requests
import base64

class Database:
    def __init__(self, username, password, host, port, service_name):
        dsn = cx_Oracle.makedsn(host, port, service_name=service_name)
        self.connection = cx_Oracle.connect(username, password, dsn)

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

previous_encounters = []

def clear_encounters():
    global previous_encounters
    while True:
        time.sleep(300)
        previous_encounters = []

def send_encounters(encounters_list):
    try:
        images = []
        for encounter in encounters_list:
            image = cv2.imread('encounters/' + encounter["image"] + '.jpg')
            image_data = cv2.imencode('.jpg', image)[1].tobytes()
            images.append(base64.b64encode(image_data).decode('utf-8'))

        for i in range(len(encounters_list)):
            encounters_list[i]["image"] = images[i]
        print(type(encounters_list))
        response = requests.post("http://192.168.0.100:3001/notify", json=encounters_list)
        if response.status_code == 200:
            print("Encounters sent successfully")
        else:
            print("Failed to send encounters")
    except Exception as e:
        print("Error sending encounters:", e)

if __name__ == "__main__":
    db = Database(username="aimlb4",
                  password="vishalsai",
                  host="localhost",
                  port="1521",
                  service_name="xe")

    time_period_minutes = 5  # Adjust the time period as needed

    encounter_clearer_thread = threading.Thread(target=clear_encounters)
    encounter_clearer_thread.daemon = True
    encounter_clearer_thread.start()

    size = len(os.listdir("encounters"))
    column_names = ["name", "confidence", "timestamp", "image", "camerasocketurl", "location", "camera_id"]
    while True:
        new_size = len(os.listdir("encounters"))
        if size != new_size:
            encounters = db.get_unique_encounters(time_period_minutes)
            encounter_list = []
            for encounter in encounters:
                # Assuming you have a list of column names to work with
                encounter_details = dict(zip(column_names, encounter))
                # print("Encounter details:", encounter_details)
                if encounter_details["name"] not in previous_encounters:
                    previous_encounters.append(encounter_details["name"])
                    # Append the encounter details to the list
                    encounter_list.append(encounter_details)

            if len(encounter_list) > 0:
                print("Encounters:", encounter_list)
                print("Previous encounters:", previous_encounters)
                send_encounters(encounter_list)
            # print("Previous encounters:", previous_encounters)