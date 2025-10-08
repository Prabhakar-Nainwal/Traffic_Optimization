import cv2
from ultralytics import YOLO
import requests
import json
from datetime import datetime, timezone
import easyocr
import time

# --- CONFIGURATION ---
# Path to your custom-trained YOLOv8 model
MODEL_PATH = 'best.pt'
# URL of your Node.js backend endpoint for incoming vehicles
BACKEND_URL = "http://localhost:5000/api/incoming"
# Time to wait (in seconds) before sending data for the same plate again
COOLDOWN_SECONDS = 10

# --- INITIALIZATION ---
try:
    # Load your custom-trained ANPR model
    model = YOLO(MODEL_PATH)
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit()

try:
    # Initialize the OCR reader. This will download the necessary models the first time.
    reader = easyocr.Reader(['en'], gpu=True) # Set gpu=True if you have a powerful NVIDIA GPU
    print("✅ OCR reader initialized.")
except Exception as e:
    print(f"❌ Error initializing OCR reader: {e}")
    exit()

# Initialize the laptop camera
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Error: Could not open camera.")
    exit()

# Dictionary to keep track of recently detected plates to avoid spamming the backend
plate_tracker = {}

print("\n🚀 Starting real-time detection...")

# --- MAIN LOOP ---
while True:
    # Read a frame from the camera
    success, frame = cap.read()
    if not success:
        print("❌ Failed to grab frame.")
        break

    # Run the YOLO model on the current frame
    results = model(frame, verbose=False)

    # Process each detected object in the frame
    for result in results:
        for box in result.boxes:
            # --- 1. EXTRACT DATA FROM MODEL ---
            # Get bounding box coordinates [x1, y1, x2, y2]
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            # Get the confidence score
            confidence = float(box.conf[0])
            # Get the class ID and name (e.g., 'private_ice')
            class_id = int(box.cls[0])
            class_name = model.names[class_id]

            # Filter out low-confidence detections
            if confidence > 0.6:
                # --- 2. PERFORM OCR ON THE PLATE ---
                # Crop the license plate from the frame
                plate_crop = frame[y1:y2, x1:x2]
                # Use EasyOCR to read the text
                ocr_result = reader.readtext(plate_crop, detail=0, paragraph=False)
                
                if ocr_result:
                    number_plate = "".join(ocr_result).replace(" ", "").upper()
                    
                    # --- 3. PREPARE DATA FOR BACKEND (UPDATED) ---
                    try:
                        # Parse the class name (e.g., 'private_ice') into category and fuel type
                        category, fuel = class_name.split('_')
                        vehicle_category = "private" if "private" in category else "commercial"
                        fuel_type = "EV" if "ev" in fuel else "ICE"

                        # Check if this plate is in the cooldown tracker
                        current_time = time.time()
                        if number_plate not in plate_tracker or (current_time - plate_tracker[number_plate]) > COOLDOWN_SECONDS:
                            
                            # Update the tracker
                            plate_tracker[number_plate] = current_time
                            
                            # Construct the JSON payload in the required format
                            payload = {
                                "numberPlate": number_plate,
                                "vehicleCategory": vehicle_category,
                                "fuelType": fuel_type,
                                "confidence": round(confidence, 2)
                            }

                            # --- 4. SEND DATA TO BACKEND ---
                            try:
                                print(f"➡️  Sending: {payload}")
                                response = requests.post(BACKEND_URL, json=payload, timeout=5)
                                if response.status_code == 201:
                                    print("✅ Successfully sent to backend.")
                                else:
                                    print(f"⚠️  Backend responded with status: {response.status_code}")
                            except requests.exceptions.RequestException as e:
                                print(f"❌ Failed to send data to backend: {e}")

                    except ValueError:
                        print(f"⚠️  Warning: Could not parse class name '{class_name}'")

                # --- 5. VISUALIZATION ---
                # Draw the bounding box and the detected number plate on the frame for display
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                label = f"{number_plate} ({class_name})" if ocr_result else class_name
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)


    # Display the final frame in a window
    cv2.imshow("ANPR - Press 'q' to quit", frame)

    # Check if the 'q' key is pressed to exit the loop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# --- CLEANUP ---
cap.release()
cv2.destroyAllWindows()
print("🛑 Detection stopped.")