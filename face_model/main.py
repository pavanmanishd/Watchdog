import cv2
import numpy as np
from skimage.feature import hog
from skimage import exposure
import os

# Step 1: Data Preparation

dataset_dir = 'dataset'  # Change this to the path of your dataset
known_faces = {}

# Step 2: Feature Extraction

def extract_hog_features(image):
    # Resize the image to a consistent size
    image = cv2.resize(image, (64, 128))  # You can adjust the dimensions
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    fd, hog_image = hog(image, pixels_per_cell=(8, 8), cells_per_block=(2, 2), visualize=True)
    hog_image_rescaled = exposure.rescale_intensity(hog_image, in_range=(0, 10))
    return fd

for person_name in os.listdir(dataset_dir):
    person_dir = os.path.join(dataset_dir, person_name)
    if os.path.isdir(person_dir):
        features = []
        for image_filename in os.listdir(person_dir):
            image_path = os.path.join(person_dir, image_filename)
            image = cv2.imread(image_path)
            if image is not None:
                features.append(extract_hog_features(image))
        known_faces[person_name] = features

# Step 3: Recognition

def recognize_face(input_features, known_faces):
    min_distance = float('inf')
    recognized_person = None

    for person, features in known_faces.items():
        for feature in features:
            distance = np.linalg.norm(np.array(input_features) - np.array(feature))
            if distance < min_distance:
                min_distance = distance
                recognized_person = person

    return recognized_person

# Step 4: Testing

test_image_path = './test_image.jpeg'  # Change this to the path of your test image
input_image = cv2.imread(test_image_path)

if input_image is not None:
    input_features = extract_hog_features(input_image)
    recognized_person = recognize_face(input_features, known_faces)

    if recognized_person:
        print(f'Recognized Person: {recognized_person}')
    else:
        print('No match found.')
else:
    print('Test image not found or could not be read.')
