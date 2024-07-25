# YOLOv8 PPE Detection Training Notebook

This repository contains code for setting up, training, and performing inference using the YOLOv8 (You Only Look Once version 8) object detection model. YOLOv8 is a state-of-the-art real-time object detection system known for its high accuracy and efficiency.

## General Information

YOLOv8 is the latest iteration in the YOLO series, offering significant improvements in accuracy and performance over previous versions. It is designed to handle various object detection tasks efficiently, making it suitable for a range of applications from autonomous driving to real-time video analysis.

### YOLO (You Only Look Once)

YOLO (You Only Look Once) models detect objects in real-time by processing the entire image in a single pass. The image is divided into a grid, with each cell predicting bounding boxes, class probabilities, and objectness scores for objects within that cell.

For this project, **YOLOv8s** was used:
- **YOLOv8s**: The "s" stands for "small," indicating a lighter model variant designed for lower computational requirements. While the full YOLOv8 model might provide higher performance, the YOLOv8s variant was chosen due to the limited capabilities of the Jetson Nano, which requires real-time inference with reduced resource usage.

![image](https://github.com/user-attachments/assets/7a526767-926d-47f7-9c3c-a36776a42ef0)


### Ultralytics

Ultralytics is the organization behind YOLOv8, providing the implementation and extensive documentation for training, validating, and deploying YOLOv8 models. Their tools are widely used in the computer vision community for their ease of use and performance.

**Key Features of Ultralytics YOLOv8:**
- **Training and Validation:** Ultralytics offers a comprehensive suite for training and validating object detection models. The training process can be easily customized through command-line arguments and configuration files.
- **Inference and Prediction:** The library supports efficient inference on both images and video streams, enabling real-time object detection.
- **Model Exporting:** YOLOv8 models can be exported for deployment on various platforms, including edge devices with limited computational power.

You can find detailed documentation and additional resources on Ultralytics' official website: [Ultralytics YOLOv8 Documentation](https://docs.ultralytics.com/modes/).

## Training Ressource
Google Colab provides free access to GPUs, which can be quite useful for basic training rounds and inference. However, please be aware of the following considerations:

- **Resource Limitations**: The free tier of Google Colab offers limited GPU resources. This may be sufficient for simple training tasks and inference but can quickly become inadequate for extensive parameter studies or larger models.

- **Resource Depletion**: Due to the constraints on GPU availability and usage time, resources may be depleted rapidly, affecting your ability to conduct long or complex experiments.

- **Connectivity Issues**: Users may experience occasional connectivity problems that could hinder development and progress.

- **Additional Resources**: For projects requiring more substantial resources, Google Colab offers options to purchase additional computational power.

Depending on your project's needs, you may need to evaluate whether Google Colab meets your requirements or if alternative platforms with more robust resources are more suitable.

## Running the notebook

### Requirements

To use this repository, you'll need the following:

- **Python 3.7 or higher**
- **Google Colab or a compatible Python environment**
- **GPU support** (recommended for training)
- **Required Python packages**:
  - `ultralytics`
  - `torch`
  - `torchvision`
  - `opencv-python`
  - `numpy`
  - `matplotlib`

### Step 1: Setup
The Setup step covers the installation and import of required packages, as well as the mount of the google drive. This is necessary to grant Google Drive access to your dataset. If you do not use Colab for run the notebeook, the mounting step can be skipped.

### Step 2: Data Import and Preperation
Step 2 is used to load the data from the Drive and turn them into a dataset. The final outputs were added to pinpoint discrepancy between the number of the labels and images.
When using ultralytics, step 2 can be skipped entirely. If step 2 is run before 3, loading the data for training will be quicker. 

### Step 3: Load and Finetune pretrained model
The yolov8 pretrained model was finetuned several times with variation in the training hyperparameters. If you are set in the training parameters, you only need to run the training code once. The ultralytics package offers a great variety of metrics for the evaluation of the model, which are automatically generated and saved in the /runs folder, which is created automatically during training. 

### Step 4: Inference
Inference on test images or videos can be performed by loading the model through the path to the saved weights (see Step 3). If you choose to perform inference through the model.predict() function, you need to turn the weights into a model after loading them (this is not necessary, if you perform inference through the line command). 
The "save", "save_txt" and "project" functions were found to be useful to label additional data after the model has achieved a satisfactory accuracy. Through that you can specify the path for the model output, where the labelled images, as well as the labels in YOLO format will be saved. (Labels then need to be manually controlled and adjusted before further training rounds, but an intiial labelling saves time, if model performance is good).

## Acknowledgments
YOLOv8 (Ultralytics) for object detection.
Google Colab for providing a cloud-based environment.
