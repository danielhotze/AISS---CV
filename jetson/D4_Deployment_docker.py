import cv2
from ultralytics import YOLO


#-------------------------------------------------------------#
#Import, Info & Setup 
##### : -Import video file
#       -Load YOLO
#       -Create a list to store the results
#       -Get Video info
#       -Initialize the VideoWriter object
#-------------------------------------------------------------#

#Import video file
video = cv2.VideoCapture('/Users/ben/Downloads/test_video_2_29s.mp4')

# Load YOLO
#model = YOLO('yolov8s.pt')
model = YOLO('model.pt')

#Create a list to store the results
results = []

# Initialize the VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'avc1')  # For .mp4
output_video_path = '/Users/ben/Downloads/output_video_2_29s.mp4'
frame_width = int(video.get(3))
frame_height = int(video.get(4))
fps = video.get(cv2.CAP_PROP_FPS)
out = cv2.VideoWriter(output_video_path, fourcc, fps, (frame_width, frame_height))

# Print Input Video Info
print("Frame Width and Height is:")
print(frame_width, " x " ,frame_height)
print(f"Frame rate of the input video: {fps} FPS")

#-------------------------------------------------------------#
#Preprocessing
##### : -DEF Color conversion
#-------------------------------------------------------------#

def preprocessing(raw_frame):
    frame = cv2.cvtColor(raw_frame, cv2.COLOR_BGR2RGB) 
    return frame


#-------------------------------------------------------------#
# Inference
##### : -DEF Inference
#-------------------------------------------------------------#

def inference(model, raw_frame):
    single_result = model.predict(frame, save=False)
    return single_result


#-------------------------------------------------------------#
# Draw bounding boxes
##### : -Draw bounding boxes on BGR-frame
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
# Main Loop
##### : -Loop through the video and run the model
#       -Save the results in a list
#       -Draw Bounding Boxes
#       -Save the video
#-------------------------------------------------------------#
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


# Release the video
video.release()
out.release()
cv2.destroyAllWindows()



