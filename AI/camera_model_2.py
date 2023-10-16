from datetime import datetime
from threading import Thread, Lock
import cv2, time
import socket
from requests import get
import numpy as np
from os import listdir, path
from face_recognition import face_encodings, face_locations, face_distance
from queue import Queue
import cx_Oracle
import os
import json
import logging

HOST = '192.168.0.106'
PORT = 8090
FPS = 60
IMG_WIDTH = 640
IMG_HEIGHT = 480
DATE_FORMAT = "%Y%m%d_%H%M%S_%f"
DATABASE_UPDATING = Lock()
THREADS_PER_CAMERA = 2

# logging.basicConfig(filename='model.log', format='%(asctime)s %(levelname)s:%(message)s', datefmt='%m/%d/%Y %I:%M:%S %p', level=logging.DEBUG, encoding='utf-8')
logging.basicConfig(
    filename = 'model.log',
    # encoding = 'utf-8',
    format='%(asctime)s,%(msecs)03d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s',
    datefmt='%Y-%m-%d:%H:%M:%S',
    level=logging.DEBUG)

class Model(object):
    def __init__(self, known_faces_dir):
        self.known_faces = {}
        self.load_known_faces(known_faces_dir)
        print('[INFO] Model loaded')

    def load_known_faces(self, known_faces_dir):
        for person_name in os.listdir(known_faces_dir):
            person_dir = os.path.join(known_faces_dir, person_name)
            if os.path.isdir(person_dir):
                features = []
                for image_filename in os.listdir(person_dir):
                    image_path = os.path.join(person_dir, image_filename)
                    image = cv2.imread(image_path)
                    if image is not None:
                        features.append(self.extract_hog_features(image))
                self.known_faces[person_name] = features
    
    def updater(self):
        try:
            size = 0
            size = os.path.getsize('known_faces.txt')
            new_size = 0
            while True:
                new_size = 0
                try:
                    new_size = os.path.getsize('known_faces.txt')
                except:
                    continue
                if new_size != size:
                    print('[INFO] Updating model...')
                    logging.info('Updating model...')
                    with DATABASE_UPDATING:
                        self.update()
                    print('[INFO] Model updated')
                    logging.info('Model updated')
                    size = new_size
        except:
            pass
        time.sleep(1)

    def update(self):
        with open('known_faces.txt', 'r') as f:
            data = f.read()
            known_faces_data = data.split('\n')
            known_face_names = known_faces_data[-1].split(',') 
            known_faces_encodings = [np.array(list(map(float, i.split(',')))) for i in known_faces_data[:-1]]
            self.known_face_encodings = known_faces_encodings
            self.known_face_names = known_face_names

    def extract_hog_features(self, image):
        # Resize the image to a consistent size
        image = cv2.resize(image, (64, 128))  # You can adjust the dimensions
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Compute gradients using Sobel operators
        gradient_x = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=1)
        gradient_y = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=1)
        
        # Calculate magnitude and orientation of gradients
        magnitude = np.sqrt(gradient_x**2 + gradient_y**2)
        orientation = np.arctan2(gradient_y, gradient_x)
        
        # Define parameters for HOG
        cell_size = (8, 8)
        block_size = (2, 2)
        num_bins = 9
        
        # Calculate the number of cells in each dimension
        cells_per_block_x = int(image.shape[1] / cell_size[1])
        cells_per_block_y = int(image.shape[0] / cell_size[0])
        
        # Initialize HOG feature vector
        hog_features = []
        
        for y in range(cells_per_block_y):
            for x in range(cells_per_block_x):
                # Select the cells in this block
                block_magnitude = magnitude[y*cell_size[0]:(y+block_size[1])*cell_size[0], x*cell_size[1]:(x+block_size[0])*cell_size[1]]
                block_orientation = orientation[y*cell_size[0]:(y+block_size[1])*cell_size[0], x*cell_size[1]:(x+block_size[0])*cell_size[1]]
                
                # Calculate histogram for this block
                hist, _ = np.histogram(block_orientation, bins=num_bins, range=(0, 2 * np.pi), weights=block_magnitude)
                hog_features.extend(hist)
        
        # Normalize the HOG feature vector
        hog_features = np.array(hog_features)
        hog_features /= np.linalg.norm(hog_features)
        
        return hog_features

    def recognize_faces(self, frame, encounter_time, camerasocketurl, location, camera_id, distance_threshold=0.4):
        input_features = self.extract_hog_features(frame)

        confidence_levels = []
        encounter_details = {}

        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            face_roi = frame[y:y+h, x:x+w]
            face_features = self.extract_hog_features(face_roi)
            
            recognized_person = self.recognize_face(face_features, encounter_time)
            
            if recognized_person:
                confidence_levels.append(recognized_person[1])
                name = recognized_person[0]
                encounter_details[name] = {
                    'confidence': recognized_person[1], 
                    'encounter_time': encounter_time,
                    'camerasocketurl': camerasocketurl,
                    'location': location,
                    'camera_id': camera_id
                }
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.rectangle(frame, (x, y-35), (x+w, y), (0, 255, 0), cv2.FILLED)
                cv2.putText(frame, f"{name} ({recognized_person[1]:.2f})", (x+6, y-6), cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)

        if confidence_levels:
            return True, frame, encounter_details
        else:
            return False, frame, encounter_details
    
    def recognize_face(self, input_features, encounter_time):
        min_distance = float('inf')
        recognized_person = None

        for person, features in self.known_faces.items():
            for feature in features:
                distance = np.linalg.norm(input_features - feature)  # Using L2 distance
                if distance < min_distance:
                    min_distance = distance
                    recognized_person = (person, 1.0 - min_distance)

        return recognized_person

        


class Stream():
    def __init__(self):
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server.bind((HOST, PORT))
        self.server.listen(1)
        print('[INFO] Stream server started at', HOST, PORT)
        logging.info('Stream server started at %s %s', HOST, PORT)
        self.conn, self.addr = self.server.accept()
        print('[INFO] Stream client connected at', self.addr)
        logging.info('Stream client connected at %s', self.addr)

    def send(self, data):
        self.conn.send(data)

class Camera(object):
    def __init__(self, details:dict, camera_buffer:Queue=None):
        self.url = int(details['url'])
        self.location = details['location']
        self.camera_id = details['camera_id']
        self.capture = cv2.VideoCapture(self.url)
        self.capture.set(cv2.CAP_PROP_BUFFERSIZE, 2)
       
        self.FPS = 1/FPS
        self.FPS_MS = int(self.FPS * 1000)
        
        self.thread = Thread(target=self.update, args=(camera_buffer,))
        self.thread.daemon = True
        print('[INFO] Frame capturing started from camera', self.url)
        logging.info('Frame capturing started from camera %s', self.url)
        self.thread.start()

        
    def update(self, camera_buffer:Queue=None):
        while True:
            if self.capture.isOpened():
                (self.status, self.frame) = self.capture.read()
                if camera_buffer:
                    camera_buffer.put((datetime.now().strftime(DATE_FORMAT)[:-3], self.frame))
                    camera_buffer.task_done()
            
    def show_frames(self):
        while True:
            try:
                cv2.imshow('Camera'+str(self.url), self.frame)
                cv2.waitKey(self.FPS_MS)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    self.capture.release()
                    cv2.destroyAllWindows()
                    exit(0)
            except:
                pass

    def show_frames_thread(self):
        while True:
            try:
                cv2.imshow('Camera '+str(self.url), self.frame)
                cv2.waitKey(self.FPS_MS)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    cv2.destroyAllWindows()
                    exit(0)
            except:
                pass

class Network_Camera(object):
    def __init__(self, details:dict, camera_buffer:Queue=None):
        self.url = details['url']+'shot.jpg'
        self.location = details['location']
        self.camera_id = details['camera_id']
        self.camera_buffer = camera_buffer
        self.FPS = 1/FPS
        self.FPS_MS = int(self.FPS * 1000)

        self.thread = Thread(target=self.update, args=(camera_buffer,))
        self.thread.daemon = True
        print('[INFO] Frame capturing started from network camera', self.url)
        logging.info('Frame capturing started from network camera %s', self.url)
        self.thread.start()
        
    def update(self, camera_buffer:Queue=None):
        while True:
            try:
                img = get(self.url)
                self.frame = cv2.imdecode(np.array(bytearray(img.content), dtype=np.uint8), -1)
                if camera_buffer:
                    camera_buffer.put((datetime.now().strftime(DATE_FORMAT)[:-3], self.frame))
                    camera_buffer.task_done()
            except:
                continue

    def show_frames(self):
        while True:
            try:
                cv2.imshow('Network Camera'+self.url, self.frame)
                cv2.waitKey(self.FPS_MS)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    cv2.destroyAllWindows()
                    exit(0)
            except:
                pass

    def show_frames_thread(self):
        while True:
            try:
                cv2.imshow('Network Camera '+self.url, self.frame)
                cv2.waitKey(self.FPS_MS)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    cv2.destroyAllWindows()
                    exit(0)
            except:
                pass 

class Threaded_Cameras():
    def __init__(self, cameras:dict):
        self.n = len(cameras)
        self.cameras = [Network_Camera(cameras[i]) if i=='Network' else Camera(cameras[i]) for i in cameras]
        self.threads = [Thread(target=self.cameras[i].show_frames_thread, args=()) for i in range(self.n)]
        for thread in self.threads:
            thread.daemon = True
            thread.start()
    
    def get_cameras(self):
        return self.cameras

class DataBase():
    def __init__(self):
        self.username = "aimlb4"
        self.password = "vishalsai"
        self.host = "localhost"
        self.port = "1521"
        self.service_name = "xe"
        while True:
            try:
                dsn = cx_Oracle.makedsn(self.host, self.port, service_name=self.service_name)
                self.connection = cx_Oracle.connect(self.username, self.password, dsn)
                print('[INFO] Database connected')
                logging.info('Database connected')
                break
            except:
                print('[ERROR] Database connection failed')
                logging.error('Database connection failed')
                print('[INFO] Retrying again...')
                logging.info('Retrying again...')
        
    def insert(self, file_name, encounter_details):
        with self.connection.cursor() as cursor: 
            for encounter in encounter_details:
                query = 'insert into encounters values(:name, :confidence, :timestamp, :image, :camerasocketurl, :location, :camera_id)'
                values = {
                    "name": encounter,
                    "confidence": '%.2f%%'%(encounter_details[encounter]["confidence"]*100),
                    "timestamp": datetime.strptime(encounter_details[encounter]["encounter_time"], DATE_FORMAT),
                    "image": file_name,
                    "camerasocketurl": encounter_details[encounter]["camerasocketurl"],
                    "location": encounter_details[encounter]["location"],
                    "camera_id": encounter_details[encounter]["camera_id"]
                }
                values["timestamp"] = values["timestamp"].strftime('%d-%b-%Y %H:%M:%S')
                cursor.execute(query, values)
            self.connection.commit()

class Threaded_Model():
    def __init__(self, cameras: dict):
        print('[INFO] Loading model...')
        logging.info('Loading model...')
        self.model = Model('train_images')
        self.models = [self.model for _ in range(len(cameras))]
        self.camera_details = cameras

        print('[INFO] Connecting to database...')
        logging.info('Connecting to database...')
        self.db = DataBase()

        self.n = len(cameras)
        self.camera_types = [cameras[i]['type'] for i in cameras]
        self.camera_names = [i for i in cameras]

        print('[INFO] Initializing directory updater thread...')
        logging.info('Initializing directory updater thread...')
        self.dir_updater_thread = Thread(target=self.model.updater, args=())
        self.dir_updater_thread.daemon = True
        self.dir_updater_thread.start()

        print('[INFO] Initializing camera buffers...')
        logging.info('Initializing camera buffers...')
        self.camera_buffers = [Queue() for _ in range(self.n)]

        print('[INFO] Initializing processed buffers...')
        logging.info('Initializing processed buffers...')
        self.processed_buffers = [Queue() for _ in range(self.n)]

        self.processed_frames = Queue()

        print('[INFO] Starting frame capturing...')
        logging.info('Starting frame capturing...')
        self.cameras = [Network_Camera(details=cameras[self.camera_names[i]] , camera_buffer=self.camera_buffers[i]) if self.camera_types[i] == 'Network' else Camera(details=cameras[self.camera_names[i]], camera_buffer=self.camera_buffers[i]) for i in range(self.n)]

        print('[INFO] Starting frame processing...')
        logging.info('Starting frame processing...')
        self.frame_process_threads = [Thread(target=self.process_frames, args=(i%self.n,)) for i in range(self.n * THREADS_PER_CAMERA)]
        for thread in self.frame_process_threads:
            thread.daemon = True
            thread.start()

        print('[INFO] Starting frame saving...')
        logging.info('Starting frame saving...')
        self.show_frames_thread = Thread(target=self.save_frames)
        self.show_frames_thread.daemon = True
        self.show_frames_thread.start()


    def process_frames(self, camera_index:int):
        model = self.models[camera_index]
        while True:
            try:
                encounter_time, frame = self.camera_buffers[camera_index].get(block=False)
                found, frame, encounter_details = model.recognize_faces(frame, 
                    encounter_time=encounter_time, 
                    camerasocketurl=self.camera_details[self.camera_names[camera_index]]['url'], 
                    location=self.camera_details[self.camera_names[camera_index]]['location'], 
                    camera_id=self.camera_details[self.camera_names[camera_index]]['camera_id'])
                if found:
                    self.processed_buffers[camera_index].put((encounter_time, frame, encounter_details))
                self.camera_buffers[camera_index].task_done()
            except:
                continue

    def save_frames(self):
        while True:
            for i in range(self.n):
                try:
                    encounter_time, frame, encounter_details = self.processed_buffers[i].get(block=False)
                    self.processed_buffers[i].task_done()
                    file_name = self.camera_names[i] + '_' + str(encounter_time)
                    cv2.imwrite('encounters/' + file_name + '.jpg', frame)
                    print('[INFO] Encounter saved to encounters/' + file_name + '.jpg')
                    logging.info('Encounter saved to encounters/%s.jpg', file_name)
                    Thread(target=self.db.insert, args=(file_name, encounter_details)).start()
                except:
                    pass


if __name__ == '__main__':
    camera_details = json.load(open('config.json', 'r'))['cameras']
    cams = dict()
    for camera in camera_details:
        cams[camera_details[camera]['name']] = {'type':camera_details[camera]['type'], 'url':camera_details[camera]['url'], 'location':camera_details[camera]['location'], 'camera_id':camera}

    tc = Threaded_Model(cams)
    while True:
        continue