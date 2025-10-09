import cv2
from ultralytics import YOLO
import requests
import easyocr
import time
import numpy as np

# --- CONFIGURATION ---
MODEL_PATH = 'best.pt'  # YOLO model detecting license plates
BACKEND_URL = "http://localhost:5000/api/incoming"
COOLDOWN_SECONDS = 10   # Minimum interval to send same plate

# --- INITIALIZATION ---
try:
    model = YOLO(MODEL_PATH)
    print("✅ YOLO model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading YOLO model: {e}")
    exit()

try:
    reader = easyocr.Reader(['en'], gpu=False)
    print("✅ OCR reader initialized.")
except Exception as e:
    print(f"❌ Error initializing OCR reader: {e}")
    exit()

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Error: Could not open camera.")
    exit()

# Track recently detected plates
plate_tracker = {}

# --- HELPER FUNCTIONS ---
def preprocess_plate(plate_crop):
    """Resize, grayscale, denoise, and threshold the plate image for OCR."""
    # Resize if too small
    h, w = plate_crop.shape[:2]
    if h < 60:
        plate_crop = cv2.resize(plate_crop, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 11, 17, 17)  # Noise reduction
    gray = cv2.equalizeHist(gray)  # Improve contrast
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh

def deskew_plate(plate_crop):
    """Correct skew/rotation in plate image."""
    gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
    coords = np.column_stack(np.where(gray > 0))
    if len(coords) == 0:
        return plate_crop
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = plate_crop.shape[:2]
    M = cv2.getRotationMatrix2D((w//2, h//2), angle, 1.0)
    rotated = cv2.warpAffine(plate_crop, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated

def clean_plate_text(text):
    """Keep only alphanumeric and uppercase characters."""
    return "".join([c for c in text if c.isalnum()]).upper()

# --- MAIN LOOP ---
print("\n🚀 Starting real-time detection...")
while True:
    success, frame = cap.read()
    if not success:
        print("❌ Failed to grab frame.")
        break

    results = model(frame, verbose=False)

    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = model.names[class_id]

            if confidence > 0.6:
                # Crop and process plate
                plate_crop = frame[y1:y2, x1:x2]
                plate_crop = deskew_plate(plate_crop)
                preprocessed_plate = preprocess_plate(plate_crop)

                # OCR
                ocr_result = reader.readtext(preprocessed_plate, detail=0, paragraph=False)

                if ocr_result:
                    number_plate = clean_plate_text("".join(ocr_result))

                    # Parse class name into category & fuel type
                    try:
                        category, fuel = class_name.split('_')
                        vehicle_category = "private" if "private" in category else "commercial"
                        fuel_type = "EV" if "ev" in fuel.lower() else "ICE"

                        current_time = time.time()
                        if number_plate not in plate_tracker or (current_time - plate_tracker[number_plate]) > COOLDOWN_SECONDS:
                            plate_tracker[number_plate] = current_time
                            payload = {
                                "numberPlate": number_plate,
                                "vehicleCategory": vehicle_category,
                                "fuelType": fuel_type,
                                "confidence": round(confidence, 2)
                            }

                            # Send data to backend
                            try:
                                print(f"➡️ Sending: {payload}")
                                response = requests.post(BACKEND_URL, json=payload, timeout=5)
                                if response.status_code == 201:
                                    print("✅ Successfully sent to backend.")
                                else:
                                    print(f"⚠️ Backend responded with status: {response.status_code}")
                            except requests.exceptions.RequestException as e:
                                print(f"❌ Failed to send data: {e}")

                    except ValueError:
                        print(f"⚠️ Could not parse class name '{class_name}'")

                # Visualization
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                label = f"{number_plate} ({class_name})" if ocr_result else class_name
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX,
                            0.7, (0, 255, 0), 2)

    cv2.imshow("ANPR - Press 'q' to quit", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# --- CLEANUP ---
cap.release()
cv2.destroyAllWindows()
print("🛑 Detection stopped.")
