import numpy as np
import cv2
import os

def generate_dataset(dataset_path, target_size=(128, 128)):
    dataset = []
    labels = []

    for subdir in os.listdir(dataset_path):
        subdir_path = os.path.join(dataset_path, subdir)
        if os.path.isdir(subdir_path):
            for image_filename in os.listdir(subdir_path):
                image_path = os.path.join(subdir_path, image_filename)
                img = cv2.imread(image_path)

                # Ensure all images have the same dimensions by resizing
                img = cv2.resize(img, target_size)

                dataset.append(img)
                labels.append(subdir)  # Using directory name as the label

    return np.array(dataset), labels

# Generate a dataset and labels (Modify dataset_path accordingly)
dataset_path = './dataset'
dataset, labels = generate_dataset(dataset_path)
print(labels)
