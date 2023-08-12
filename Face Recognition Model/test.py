import cv2
import pytesseract

def recognize_license_plate(image_path):
    # Load the image using OpenCV
    image = cv2.imread(image_path)
    
    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply thresholding to segment the license plate characters
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Perform text extraction using pytesseract
    custom_config = r'--oem 3 --psm 6'
    plate_number = pytesseract.image_to_string(thresh, config=custom_config)
    
    # Remove any non-alphanumeric characters from the extracted text
    plate_number = ''.join(filter(str.isalnum, plate_number))
    
    return plate_number

if __name__ == "__main__":
    image_path = "new_face_dir/car.jpeg"  # Replace with the path to your image file

    try:
        plate_number = recognize_license_plate(image_path)
        if plate_number:
            print(f"Detected license plate: {plate_number}")
        else:
            print("No license plate detected")
    except Exception as e:
        print(f"An error occurred: {e}")
