import csv
import cv2
import numpy as np
import ast
import os

# Create a directory to save images
if not os.path.exists('car_images'):
    os.makedirs('car_images')

# Load data from interpolated CSV
interpolated_data = []
with open('test_interpolated.csv', 'r') as file:
    reader = csv.DictReader(file)
    interpolated_data = list(reader)

# Load the original video for image extraction
cap = cv2.VideoCapture('sample.mp4')

for row in interpolated_data:
    frame_nmr = int(row['frame_nmr'])
    car_id = int(row['car_id'])
    license_plate_number = row['license_number']

    # Set video to the corresponding frame
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_nmr)
    ret, frame = cap.read()

    if ret:
        car_x1, car_y1, car_x2, car_y2 = ast.literal_eval(row['car_bbox'].replace('[ ', '[').replace('   ', ' ').replace('  ', ' ').replace(' ', ','))
        license_plate_x1, license_plate_y1, license_plate_x2, license_plate_y2 = ast.literal_eval(row['license_plate_bbox'].replace('[ ', '[').replace('   ', ' ').replace('  ', ' ').replace(' ', ','))

        # Draw bounding box around car and license plate
        cv2.rectangle(frame, (int(car_x1), int(car_y1)), (int(car_x2), int(car_y2)), (0, 255, 0), 2)
        cv2.rectangle(frame, (int(license_plate_x1), int(license_plate_y1)), (int(license_plate_x2), int(license_plate_y2)), (255, 0, 0), 2)

        # Save the frame image with license plate number as filename
        filename = f"car_images/{license_plate_number}_frame_{frame_nmr}.jpg"
        cv2.imwrite(filename, frame)

cap.release()
# cv2.destroyAllWindows()
