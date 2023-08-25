import numpy as np
import cv2
import os
import random
import tensorflow as tf
from tensorflow.keras.layers import Input, Conv2D, Flatten, Dense, Lambda
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.models import load_model

# Define the Siamese Network architecture
def build_siamese_network(input_shape):
    input_layer = Input(input_shape)

    # Convolutional layers
    x = Conv2D(64, (10, 10), activation='relu')(input_layer)
    x = tf.keras.layers.MaxPooling2D()(x)
    x = Conv2D(128, (7, 7), activation='relu')(x)
    x = tf.keras.layers.MaxPooling2D()(x)
    x = Conv2D(128, (4, 4), activation='relu')(x)
    x = tf.keras.layers.MaxPooling2D()(x)
    x = Conv2D(256, (4, 4), activation='relu')(x)

    # Flatten the output and create the encoding
    x = Flatten()(x)
    x = Dense(4096, activation='sigmoid')(x)

    # Build the Siamese Network model
    siamese_network = Model(input_layer, x)

    return siamese_network

# Define a function to generate a dataset
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
dataset_path = 'your_dataset_directory'
dataset, labels = generate_dataset(dataset_path)

# Preprocess the dataset (Modify preprocessing steps as needed)
def preprocess_images(images):
    # Implement preprocessing steps here, e.g., resizing and normalization
    # You should preprocess the images to match the format used during training
    return images

dataset = preprocess_images(dataset)

# Define a function to create pairs of images and their labels for Siamese training
def create_pairs(dataset, labels):
    pairs = []
    labels = np.array(labels)
    num_classes = len(np.unique(labels))

    for i in range(num_classes):
        class_indices = np.where(labels == i)[0]
        for j in range(len(class_indices) - 1):
            for k in range(j + 1, len(class_indices)):
                pairs.append((dataset[class_indices[j]], dataset[class_indices[k]], 1))

    # Create pairs of images from different classes
    for i in range(num_classes):
        class_indices_1 = np.where(labels == i)[0]
        class_indices_2 = np.where(labels != i)[0]

        for j in range(len(class_indices_1)):
            for k in range(len(class_indices_2)):
                pairs.append((dataset[class_indices_1[j]], dataset[class_indices_2[k]], 0))

    random.shuffle(pairs)
    return np.array(pairs)

# Create pairs for training
pairs = create_pairs(dataset, labels)

# Split the pairs into training and validation sets
split_ratio = 0.8
split_index = int(len(pairs) * split_ratio)
train_pairs = pairs[:split_index]
val_pairs = pairs[split_index:]

# Define a custom contrastive loss function for Siamese training
def contrastive_loss(y_true, y_pred):
    margin = 1
    return tf.reduce_mean(y_true * tf.square(y_pred) + (1 - y_true) * tf.square(tf.maximum(margin - y_pred, 0)))

# Create the Siamese Network model
input_shape = dataset[0].shape
siamese_network = build_siamese_network(input_shape)

# Define the two input layers for pairs of images
input_image_1 = Input(input_shape)
input_image_2 = Input(input_shape)

# Generate embeddings for each image in the pair using the Siamese Network
embedding_1 = siamese_network(input_image_1)
embedding_2 = siamese_network(input_image_2)

# Calculate the L1 distance (Manhattan distance) between the embeddings
l1_distance = Lambda(lambda embeddings: tf.abs(embeddings[0] - embeddings[1]))([embedding_1, embedding_2])

# Add a final dense layer for binary classification (same person or not)
output_layer = Dense(1, activation='sigmoid')(l1_distance)

# Build the Siamese model
siamese_model = Model(inputs=[input_image_1, input_image_2], outputs=output_layer)

# Compile the Siamese model with the custom contrastive loss
siamese_model.compile(loss=contrastive_loss, optimizer=Adam(lr=0.00006))

# Define data generators for training and validation
def data_generator(pairs, labels, batch_size, preprocess_fn):
    num_samples = len(pairs)
    while True:
        indices = np.random.choice(num_samples, size=batch_size, replace=False)
        batch_pairs = pairs[indices]
        batch_labels = labels[indices]
        
        X1 = preprocess_fn(batch_pairs[:, 0])
        X2 = preprocess_fn(batch_pairs[:, 1])
        yield [X1, X2], batch_labels

# Define batch size and number of epochs
batch_size = 32
epochs = 10

# Train the Siamese Network
history = siamese_model.fit(
    data_generator(train_pairs, train_pairs[:, 2], batch_size, preprocess_images),
    steps_per_epoch=len(train_pairs) // batch_size,
    epochs=epochs,
    validation_data=data_generator(val_pairs, val_pairs[:, 2], batch_size, preprocess_images),
    validation_steps=len(val_pairs) // batch_size
)

# Save the trained Siamese model
siamese_model.save('siamese_face_recognition.h5')

# Load the trained Siamese model for inference
def load_and_predict(input_image_path):
    siamese_model = load_model('siamese_face_recognition.h5')
    dataset_embeddings = siamese_network.predict(dataset)
    result = compare_to_dataset(input_image_path, dataset_embeddings, labels)
    return result

# Define a function to preprocess an input image
def preprocess_input_image(image_path):
    input_image = cv2.imread(image_path)
    # Implement preprocessing steps for the input image
    # This should match the preprocessing used during training
    return preprocess_images(np.array([input_image]))

# Define a function to calculate similarity between an input image and the dataset
def compare_to_dataset(input_image_path, dataset_embeddings, labels):
    input_image = preprocess_input_image(input_image_path)
    input_embedding = siamese_network.predict(input_image)

    # Calculate L1 distances between input_embedding and dataset_embeddings
    distances = np.linalg.norm(dataset_embeddings - input_embedding, axis=1)

    # Find the index of the most similar image in the dataset
    most_similar_index = np.argmin(distances)

    # Return the label associated with the most similar image
    return labels[most_similar_index]

# Example usage for inference
input_image_path = 'your_input_image.jpg'  # Replace with the path to your input image
result = load_and_predict(input_image_path)
print("The input image is most similar to:", result)