import cv2
import numpy as np
import os

# Step 1: Data Preparation
dataset_dir = 'dataset'  # Change this to the path of your dataset
known_faces = {}

# Step 2: Feature Extraction
def extract_hog_features(image):
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
test_image_path = './pavan.jpeg'  # Change this to the path of your test image
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
