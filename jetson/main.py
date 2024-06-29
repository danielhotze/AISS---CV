import cv2
import requests
import time
import uuid
#import socket
# DH: Rough sketch of how I envision the communication with the server.
# Real implementation could use cv2 to get the images in an image feed and somewhere in there run the incident processing

######################################## VARIABLES ########################################
# Server Settings
SERVER_IP = 'localhost' # add flask API through which the server can tell the device its' IP
SERVER_API = 'http://' + SERVER_IP + ':3000/api'
INCIDENT_CREATE_API = SERVER_API + '/incidents'
IMAGE_UPLOAD_API = SERVER_API + '/incidents/image'



# Device Settings
#hostname = socket.gethostname()
#device_ip = socket.gethostbyname(hostname) # option for dynamically getting the IP-Address
DEVICE_ID = 'device1' # how do we best configure this? Probably some setup over flask API?

# Incident Variables
MAX_UNDETECTED_FRAMES = 5
SKIP_IMAGE_UPLOAD_MOD = 5 # uploading every frame might be too much - only upload every x frames
detections_counter = 0
frames_without_detection = 0
incident_uuid = None
incident_active = False
incident_type = None



######################################## LOGIC ########################################
# Server requests
def send_create_incident(incident_id, timestamp, deviceID, incidentType):
  url = 'http://' + SERVER_IP + ':3000/api/incidents'
  data = {
    'incidentID': incident_id,
    'timestamp': timestamp,
    'deviceID': deviceID,
    'incidentType': incident_type
  }
  response = requests.post(url, data=data)
  return response.json()

def send_update_incident(incident_id, timestamp):
  url = 'http://' + SERVER_IP + ':3000/api/incidents'
  data = {
    'incidentID': incident_id,
    'timestamp': timestamp
  }
  response = requests.put(url, data=data)
  return response.json()

def send_upload_image(image_path, incident_id, timestamp):
    url = 'http://' + SERVER_IP + ':3000/api/upload'
    files = {'image': open(image_path, 'rb')}
    data = {
        'incidentID': incident_id,
        'timestamp': timestamp
    }
    response = requests.post(url, files=files, data=data)
    return response.json()

# Here Camera Logic - Get frame from camera (use cv2 or something)
def get_frame_from_camera():
  return

# Here Detection Logic - Use the model to detect ppe violations
def detect_objects(frame):
  return

# Here Main Process (rough sketch - subject to change)
while True:
  frame = get_frame_from_camera() 
  detection_result = detect_objects(frame)

  if detection_result: # if some ppe violation was detected
    frames_without_detection = 0
    # for new incident or different detection type, create new incident?
    if (not incident_active) or detection_result != incident_type:
      # setup new incident data
      incident_uuid = str(uuid.uuid4())
      timestamp = time.time()
      incident_active = True
      incident_type = detection_result
      # send http post to server to create a new incident
      send_create_incident(incident_id=incident_uuid, timestamp=timestamp, deviceID=DEVICE_ID, incidentType=incident_type)
    else:
      timestamp = time.time()
      # send http put to server to update existing incident
      send_update_incident(incident_uuid, timestamp)
    if (detections_counter % SKIP_IMAGE_UPLOAD_MOD) == 0:
      # every <SKIP_IMAGE_UPLOAD_MOD> images (or the first one), we send it to the server
      send_upload_image() # insert image with detection (ideally with bounding boxes), incidentID, and timestamp
    detections_counter += 1
  else:
    frames_without_detection += 1
    # after a set amount of frames without detections, close the incident
    if frames_without_detection > MAX_UNDETECTED_FRAMES:
      incident_active = False

