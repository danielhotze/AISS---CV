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
#       -Create a list to store the results
#       -Get Video info
#       -Initialize the VideoWriter object
#       -Create incident variables and thresholds
#       -Create variables for server communication
#-------------------------------------------------------------#

#___ Import video file ___#
video = cv2.VideoCapture('/Users/ben/Downloads/test_video_2_29s.mp4')

#___ Load YOLO ___#
#model = YOLO('yolov8s.pt')
model = YOLO('model.pt')

#___ Create a list to store the results ___#
results = []

#___ Initialize the VideoWriter object ___#
fourcc = cv2.VideoWriter_fourcc(*'avc1')  # For .mp4
output_video_path = '/Users/ben/Downloads/output_video_2_29s.mp4'
frame_width = int(video.get(3))
frame_height = int(video.get(4))
fps = video.get(cv2.CAP_PROP_FPS)
out = cv2.VideoWriter(output_video_path, fourcc, fps, (frame_width, frame_height))

#___ Print Input Video Info ___#
print("Frame Width and Height is:")
print(frame_width, " x " ,frame_height)
print(f"Frame rate of the input video: {fps} FPS")

#___ Create incident variables and thresholds ___#
DETECTIONS_UNTIL_INCIDENT_START = 4 # try to filter singular "false positive" frames
FRAMES_UNTIL_INCIDENT_END = 15 # avoid closing an incident when only a few incidents are without detection
IMAGE_UPLOAD_MOD = 50 # only upload images every x frames during an acive incident

detections_counter = 0
no_incident_counter = 0

incident_id = None
incident_active = False
incident_types = []

#___ Create variables for server communication ___#
SERVER_IP = None # will be updated dynamically
SERVER_PORT = 3000
FLASK_PORT = 5000
DEVICE_ID = None #TODO: receive from somewhere?

#-------------------------------------------------------------#
# Server Communication
##### : - Flask Setup
#       - HTTP Requests
#-------------------------------------------------------------#

#___ Flask Setup ___#
app = Flask(__name__)

# '/ping' route to receive the server IP address and show that the device is active
@app.route('/ping', methods=['GET'])
def ping():
    global SERVER_IP
    if request.headers.getlist("X-Forwarded-For"):
        SERVER_IP = request.headers.getlist("X-Forwarded-For")[0]
    else:
        SERVER_IP = request.remote_addr
    print(f"Received ping from {SERVER_IP}")
    return '', 200

# Flask Thread
stop_flag = threading.Event()

def run_flask():
    while not stop_flag.is_set():
        app.run(host='0.0.0.0', port=FLASK_PORT, use_reloader=False)
        # Small sleep to prevent high CPU usage if the server stops unexpectedly
        time.sleep(1)

#___ HTTP Requests ___#
def send_create_incident(incident_id, timestamp, deviceID, incidentTypes):
    if SERVER_IP is None:
        return
    url = f'http://{SERVER_IP}:{SERVER_PORT}/api/incidents'
    data = {
        'incidentID': incident_id,
        'timestamp': timestamp,
        'deviceID': deviceID,
        'incidentTypes': incidentTypes
    }
    response = requests.post(url, data=data)
    return response.json()

def send_update_incident(incident_id, timestamp):
    if SERVER_IP is None:
        return
    url = f'http://{SERVER_IP}:{SERVER_PORT}/api/incidents'
    data = {
        'incidentID': incident_id,
        'timestamp': timestamp
    }
    response = requests.put(url, data=data)
    return response.json()

def send_upload_image(image, incident_id, timestamp):
    if SERVER_IP is None:
        return
    url = f'http://{SERVER_IP}:{SERVER_PORT}/api/upload'
    _, img_encoded = cv2.imencode('.jpg', image)
    image_name = 'img_' + str(uuid.uuid4()) + '.jpg'
    files = {'image': (image_name, img_encoded.tobytes(), 'image/jpeg')}
    data = {
        'name': image_name,
        'timestamp': timestamp,
        'incidentID': incident_id
    }
    response = requests.post(url, files=files, data=data)
    return response.json()

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
    single_result = model.predict(frame, save=False)
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

#-------------------------------------------------------------#
# Main Loop
##### : - Loop through the video and run the model
#       - Save the results in a list
#       - Draw Bounding Boxes
#       - Save the video
#-------------------------------------------------------------#

def main_loop():
    i = 0

    while True:
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
        # Append the result
        results.append(single_result)
        # Draw the bounding boxes
        bgr_frame_output = draw_bounding_boxes(bgr_frame, single_result)
        # Save the video (in current directory of termial)
        out.write(bgr_frame_output)


#-------------------------------------------------------------#
#___ Start the Flask app in a separate thread to avoid collision with main loop ___#
flask_thread = threading.Thread(target=run_flask)
flask_thread.start()

#___ Start main_loop ___#
main_loop()

#___ Release the video ___#
video.release()
out.release()
cv2.destroyAllWindows()

#___ Close Flask ___#
# Set the stop flag to stop the Flask thread and wait for Flask thread to close before exit
stop_flag.set()
flask_thread.join()

