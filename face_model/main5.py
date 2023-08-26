import cv2
import os
import numpy as np
from face_recognition import face_locations, face_encodings, face_distance, load_image_file
from http.server import SimpleHTTPRequestHandler, HTTPServer
import threading
from queue import Queue

WIDTH = 640
HEIGHT = 480
known_faces_dir = 'known_faces'
distance_threshold = 0.5
FPS = 30
FPS_MS = int(1000 / FPS)

# Initialize video capture
cap = cv2.VideoCapture(2)  # Use the default camera (usually 0)

# Load known faces
known_faces = []
known_names = []
for filename in os.listdir(known_faces_dir):
    if filename.endswith('.bmp') or filename.endswith('.jpg'):
        image_path = os.path.join(known_faces_dir, filename)
        face_image = load_image_file(image_path)
        face_encoding = face_encodings(face_image)[0]  # Select the first encoding
        known_faces.append(face_encoding)
        known_names.append(os.path.splitext(filename)[0])

# Initialize the latest_frame with an empty frame
latest_frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
frame_lock = threading.Lock()

# Function to capture frames asynchronously
def frame_capture():
    global latest_frame  # Declare latest_frame as a global variable
    while True:
        ret, frame = cap.read()
        if ret:
            frame = cv2.resize(frame, (WIDTH, HEIGHT))
            with frame_lock:
                latest_frame = frame.copy()


# Function to process frames
def frame_process():
    global latest_frame  # Declare latest_frame as a global variable
    while True:
        with frame_lock:
            frame = latest_frame.copy()  # Make a copy to avoid race conditions
        if frame is not None:
            frame_face_locations = face_locations(frame, model='cnn')  # Use the 'cnn' model for faster processing
            frame_face_encodings = face_encodings(frame, frame_face_locations)

            for face_encoding, face_location in zip(frame_face_encodings, frame_face_locations):
                distances = face_distance(known_faces, face_encoding)
                matches = [distance <= distance_threshold for distance in distances]

                if any(matches):
                    matched_index = matches.index(True)
                    confidence = 1.0 - distances[matched_index]
                    name = known_names[matched_index]
                    top, right, bottom, left = face_location
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                    cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 255, 0), cv2.FILLED)
                    cv2.putText(frame, f"{name} ({confidence:.2f})", (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)

            ret, jpeg = cv2.imencode('.jpg', frame)
            latest_frame = frame  # Update latest_frame as a NumPy array
            latest_frame_bytes = jpeg.tobytes()  # Convert the frame to bytes for response

            with frame_lock:
                latest_frame_bytes = jpeg.tobytes()


# Create threads for frame capture and processing
frame_capture_thread = threading.Thread(target=frame_capture)
frame_process_thread = threading.Thread(target=frame_process)
frame_capture_thread.daemon = True
frame_process_thread.daemon = True
frame_capture_thread.start()
frame_process_thread.start()

# HTTP Request Handler
# HTTP Request Handler
class VideoHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/video_stream':
            self.send_response(200)
            self.send_header('Content-type', 'multipart/x-mixed-replace; boundary=frame')
            self.end_headers()
            while True:
                with frame_lock:
                    if latest_frame is not None:
                        self.wfile.write(b'--frame\r\n')
                        self.wfile.write(b'Content-Type: image/jpeg\r\n\r\n')
                        self.wfile.write(latest_frame + b'\r\n')
                        self.wfile.flush()  # Ensure data is sent immediately
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Not Found')


def run_server():
    try:
        server = HTTPServer(('0.0.0.0', 8050), VideoHandler)
        print('Server started on http://0.0.0.0:8050')
        server.serve_forever()
    except KeyboardInterrupt:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == '__main__':
    run_server()
