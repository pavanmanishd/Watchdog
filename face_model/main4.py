import cv2
import face_recognition
import os
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
# import numpy as np
import asyncio

# Initialize FastAPI app
app = FastAPI()

# Directory containing known faces
known_faces_dir = './known_faces/'

# Initialize known faces and names
known_faces = []
known_names = []

# Load known faces from the directory
for filename in os.listdir(known_faces_dir):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        image_path = os.path.join(known_faces_dir, filename)
        face_image = face_recognition.load_image_file(image_path)
        face_encoding = face_recognition.face_encodings(face_image)
        if len(face_encoding) > 0:
            known_faces.append(face_encoding[0])
            known_names.append(os.path.splitext(filename)[0])

# Initialize video capture
cap = cv2.VideoCapture(0)  # Use the default camera (change to a file path if needed)

@app.get("/video_feed")
async def video_feed(request: Request):
    # Function to generate video frames and send them as a response
    async def generate():
        while True:
            await asyncio.sleep(0)  # Allow other tasks to run

            # Capture frame-by-frame
            ret, frame = cap.read()

            # Find face locations in the current frame
            face_locations = face_recognition.face_locations(frame)
            face_encodings = face_recognition.face_encodings(frame, face_locations)

            # Loop through each detected face
            for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                # Check if the face matches any known faces
                matches = face_recognition.compare_faces(known_faces, face_encoding)
                name = "Unknown"

                # If a known face is found, use the first one
                if True in matches:
                    first_match_index = matches.index(True)
                    name = known_names[first_match_index]

                # Draw a box around the face
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

                # Display the name
                font = cv2.FONT_HERSHEY_DUPLEX
                cv2.putText(frame, name, (left + 6, bottom - 6), font, 0.5, (255, 255, 255), 1)

            # Encode the frame as JPEG
            _, jpeg_frame = cv2.imencode('.jpg', frame)
            yield jpeg_frame.tobytes()

    return StreamingResponse(generate(), media_type="multipart/x-mixed-replace; boundary=frame")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
