import cv2
from ultralytics import YOLO

import threading
import time
import requests
import uuid
from flask import Flask, request


#-------------------------------------------------------------#
# Import, Info & Setup 
##### : -Import video file
#       -Load YOLO
#       -Get Video info
#       -Initialize the VideoWriter object
#       -Create incident variables and thresholds
#       -Create variables for server communication
#-------------------------------------------------------------#

#___ Import video file ___#
video = cv2.VideoCapture('/Users/Daniel/Downloads/IMG_2254.MOV')
frame_width = int(video.get(3))
frame_height = int(video.get(4))

#___ Load YOLO ___#
#model = YOLO('yolov8s.pt')
model = YOLO('model.pt')

#___ Initialize the VideoWriter object ___#
# fourcc = cv2.VideoWriter_fourcc(*'avc1')  # For .mp4
# output_video_path = '/Users/Daniel/Downloads/IMG_2254.MOV'
# fps = video.get(cv2.CAP_PROP_FPS)
# out = cv2.VideoWriter(output_video_path, fourcc, fps, (frame_width, frame_height))

#___ Print Input Video Info ___#
print("Frame Width and Height is:")
print(frame_width, " x " ,frame_height)
# print(f"Frame rate of the input video: {fps} FPS")

#___ Create incident variables and thresholds ___#
DETECTIONS_UNTIL_INCIDENT_START = 4 # Number of detections (frames) required to start an incident -> filter false positives
TIME_UNTIL_INCIDENT_END = 4000 # Time in milliseconds to wait before closing an incident after the last detection
FRAMES_UNTIL_INCIDENT_END = 10
TIME_BETWEEN_UPDATE = 2000 # Minimum time between incident updates in milliseconds
TIME_BETWEEN_IMG_UPLOAD = 4000 # Minimum time between image uploads in milliseconds

creation_counter = 0
deletion_counter = 0
last_incident_update_time = 0
last_image_upload_time = 0
last_detection_time = None

incident_id = None
incident_active = False
incident_types = []
valid_incident_types = ['person_only_with_helmet', 'person_only_with_jacket', 'person_with_full_safety', 'person_without_safety']

#___ Create variables for server communication ___#
SERVER_IP = None # will be updated dynamically
# SERVER_IP = 'localhost' #TODO: remove hardcoded SERVER_IP
SERVER_PORT = 3000
FLASK_PORT = 5000
DEVICE_ID = None
# DEVICE_ID = '3a6ee153-7fd4-4028-a80d-56fc1d31e8fe' #TODO: remove hardcoded DEVICE_ID

#-------------------------------------------------------------#
# Server Communication
##### : - Flask Setup
#       - HTTP Requests
#-------------------------------------------------------------#

#___ Flask Setup ___#
app = Flask(__name__)

# '/ping' route to receive the server IP address and show that the device is active
@app.route('/ping/<deviceID>', methods=['GET'])
def ping(deviceID):
    global SERVER_IP, DEVICE_ID
    if request.headers.getlist("X-Forwarded-For"):
        SERVER_IP = request.headers.getlist("X-Forwarded-For")[0]
    else:
        SERVER_IP = request.remote_addr
    DEVICE_ID = deviceID
    print(f"Received ping from {SERVER_IP} for this device with ID {DEVICE_ID}")
    return '', 200

# Flask Thread
stop_flag = threading.Event()

def run_flask():
    while not stop_flag.is_set():
        app.run(host='0.0.0.0', port=FLASK_PORT, use_reloader=False)
        # Small sleep to prevent high CPU usage if the server stops unexpectedly
        time.sleep(1)
    print('exiting run_flask')

#___ HTTP Requests ___#
def send_create_incident():
    global incident_id, incident_types, SERVER_IP, SERVER_PORT, incident_active
    if SERVER_IP is None:
        return
    print(f"Sending 'create_incident': {incident_id}")
    url = f'http://{SERVER_IP}:{SERVER_PORT}/api/incidents'
    data = {
        'id': incident_id,
        'timestamp': int(time.time() * 1000),
        'deviceID': DEVICE_ID,
        'incidentType': incident_types if isinstance(incident_types, list) else [incident_types]
    }
    try:
        response = requests.post(url, json=data)
        print(f'"create_incident" response status code: {response.status_code}')
        response.raise_for_status()
        if response.status_code == 200:
            incident_active = True
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending create incident: {e}")
        return None
    

def send_update_incident():
    global incident_id, incident_types, SERVER_IP, SERVER_PORT
    if SERVER_IP is None:
        return
    print(f"Sending 'update_incident': {incident_id}")
    url = f'http://{SERVER_IP}:{SERVER_PORT}/api/incidents/{incident_id}'
    data = {
        'id': incident_id,
        'timestamp': int(time.time() * 1000),
        'incidentType': incident_types if isinstance(incident_types, list) else [incident_types]
    }
    try:
        response = requests.put(url, json=data)
        print(f'"update_incident" response status code: {response.status_code}')
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending update incident: {e}")
        return None
    

def send_upload_image(image):
    global incident_id, SERVER_IP, SERVER_PORT
    if SERVER_IP is None:
        return
    print(f"Sending 'upload_image': {incident_id}")
    url = f'http://{SERVER_IP}:{SERVER_PORT}/api/upload'
    _, img_encoded = cv2.imencode('.jpg', image)
    image_name = 'img_' + str(uuid.uuid4()) + '.jpg'
    files = {'image': (image_name, img_encoded.tobytes(), 'image/jpeg')}
    data = {
        'name': image_name,
        'timestamp': int(time.time() * 1000),
        'incidentID': incident_id
    }
    try:
        response = requests.post(url, files=files, data=data)
        print(f'"upload_image" response status code: {response.status_code}')
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending upload image: {e}")
        return None
    

#-------------------------------------------------------------#
# Preprocessing
##### : - DEF Color conversion
#-------------------------------------------------------------#

def preprocessing(raw_frame):
    frame = cv2.cvtColor(raw_frame, cv2.COLOR_BGR2RGB) 
    return frame


#-------------------------------------------------------------#
# Inference
##### : - DEF Inference
#-------------------------------------------------------------#

def inference(model, raw_frame):
    single_result = model.predict(raw_frame, save=False)
    return single_result


#-------------------------------------------------------------#
# Draw bounding boxes
##### : - Draw bounding boxes on BGR-frame
#-------------------------------------------------------------#

def draw_bounding_boxes(bgr_frame, result):
    for pred in result:
        for box in pred.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = box.conf.cpu().numpy()[0]  # Extract scalar from array
            cls = box.cls.cpu().numpy()[0]  # Extract scalar from array
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            label = f'{model.names[int(cls)]} {conf:.2f}'
            cv2.rectangle(bgr_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(bgr_frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    return bgr_frame

#-------------------------------------------------------------#
# Check Violations
##### : - Utility Functions
#       - Check Conditions for Incident Creation
#       - Check Conditions for Incident Update
#       - Check Conditions for Incident Completion
#       - Check Conditions for Image Upload
#-------------------------------------------------------------#

#___ Utility Functions ___#
def create_incident_id():
    return "i_" + str(uuid.uuid4())

def is_incident_frame(result):
    global valid_incident_types
    detected_types = []
    is_incident = False
    # If there are no predictions in the frame:
    if len(result) == 0:
        set_incident_types(detected_types)
        return is_incident

    # If there are predictions in the frame:
    for pred in result:
        for box in pred.boxes:
            cls = box.cls.cpu().numpy()[0]  # Extract scalar from array
            label = f'{model.names[int(cls)]}'
            # If one of the predictions is not "full safety", it is an incident frame
            if label != 'person_with_full_safety':
                is_incident = True
            # Add each unique label to the "detected_types"
            if (label not in detected_types) and (label in valid_incident_types):
                detected_types.append(label)

    set_incident_types(detected_types)
    return is_incident

def set_incident_types(types: list):
    global incident_types
    incident_types = types

#___ Check Conditions for Incident Creation ___#
# frame-based because it is determined by model accuracy
def check_create_incident():
    global incident_active, creation_counter, DETECTIONS_UNTIL_INCIDENT_START

    creation_counter += 1
    if (not incident_active) and (creation_counter > DETECTIONS_UNTIL_INCIDENT_START):
        incident_active = True
        return True
    return False

#___ Check Conditions for Incident Update ___#
# time-based because of possibly varying frame rates
def check_update_incident():
    global incident_active, last_incident_update_time, TIME_BETWEEN_UPDATE
    current_time = time.time() * 1000

    if incident_active and (current_time - last_incident_update_time > TIME_BETWEEN_UPDATE):
        return True
    return False

#___ Check Conditions for Incident Completion ___#
# time-based because people might be blocked by objects (poles, barricades, ...) for a short amount of time
def check_close_incident():
    global incident_active, last_detection_time, TIME_UNTIL_INCIDENT_END, deletion_counter, FRAMES_UNTIL_INCIDENT_END
    current_time = time.time() * 1000

    if incident_active and (current_time - last_detection_time > TIME_UNTIL_INCIDENT_END) and (deletion_counter > FRAMES_UNTIL_INCIDENT_END):
        return True
    return False

#___ Check Conditions for Image Upload ___#
# time-based because of possibly varying frame rates
def check_image_upload():
    global incident_active, last_image_upload_time, TIME_BETWEEN_IMG_UPLOAD
    current_time = time.time() * 1000

    if incident_active and (current_time - last_image_upload_time > TIME_BETWEEN_IMG_UPLOAD):
        return True
    return False

#-------------------------------------------------------------#
# Main Loop
##### : - Loop through the video and run the model
#       - Draw Bounding Boxes
#       - Save the video
#-------------------------------------------------------------#

def main_loop():
    global incident_active, incident_id, creation_counter, last_image_upload_time, last_incident_update_time, last_detection_time, deletion_counter
    
    i = 0

    while True:
        #___ Handle frame processing: ___#

        # Counter for the frame number
        i += 1
        print(f"\nFrame number: {i}")
        # Read the video
        ret, bgr_frame = video.read()
        # Break the loop
        if not ret:
            break
        # Preprocess the frame
        frame = preprocessing(bgr_frame)
        # Run the model
        single_result = inference(model, frame)
        # Draw the bounding boxes
        bgr_frame_output = draw_bounding_boxes(bgr_frame, single_result)
        # Save the video (in current directory of termial)
        # out.write(bgr_frame_output)

        #___ Handle incident processing: ___#

        if is_incident_frame(single_result):
            # Update timestamp for last incident detection
            last_detection_time = time.time() * 1000
            deletion_counter = 0

            # Check create_incident
            if check_create_incident():
                incident_id = create_incident_id()
                creation_counter = 0
                send_create_incident()

            # Check update_incident
            if check_update_incident():
                last_incident_update_time = time.time() * 1000
                send_update_incident()

            # Check upload_image
            if check_image_upload():
                last_image_upload_time = time.time() * 1000
                send_upload_image(bgr_frame_output)

        else:
            deletion_counter += 0
            # Reset creation counter when we have frame without detection
            creation_counter = 0
            # Check if incident should be closed
            if check_close_incident():
                incident_active = False


#-------------------------------------------------------------#
#___ Start the Flask app in a separate thread to avoid collision with main loop ___#
flask_thread = threading.Thread(target=run_flask)
flask_thread.start()

#___ Start main_loop ___#
main_loop()

#___ Release the video ___#
video.release()
# out.release()
cv2.destroyAllWindows()

#___ Close Flask ___#
# Set the stop flag to stop the Flask thread and wait for Flask thread to close before exit
stop_flag.set()
flask_thread.join()
print('done')

