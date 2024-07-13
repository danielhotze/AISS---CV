# AISS-CV
A PPE detection project using Jetson Nano devices for the university course "Artificial Intelligence in Service Systems - Computer Vision" at KIT Karlsruhe

- [AISS-CV](#aiss-cv)
  - [Intro](#intro)
- [Application](#application)
  - [App Requirements](#app-requirements)
- [Jetson](#jetson)
  - [Jetson Requirements](#jetson-requirements)


## Intro
Short Introduction.

# Application
General information about the application

## App Requirements
- Install Node.js and npm. (Recommendation: Use [nvm](https://www.freecodecamp.org/news/how-to-update-node-and-npm-to-the-latest-version/))
- Navigate to 'AISS-CV\application' and run >'npm install' in the terminal to install all required node modules.
- Download and Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) for the database
- Make sure that MongoDB is running on the standard port (27017) - for new installations no action should be required for this.
- [Optional]: During Development, use "Postman" to create mock data and test api calls while no Jetson Nano Device is connected
- You should be good to go.
- In the terminal >'npm run electron' to start the app locally
- In the terminal >'npm run make' to create a distributable (executable) for your operating system (win/linux/mac) in the 'application/out' folder.

# Jetson
Content of section 3

## Jetson Requirements
What needs to be done to execute the model on a Jetson Nano Device?
- Set a static IP address on the Jetson Nano Devices (should be different for each jetson)___[A](https://hub.shinobi.video/articles/view/Z0kXCFxbQvrHcnm), [B](https://robo.fish/wiki/index.php?title=Nvidia_Jetson), [C](https://stackoverflow.com/questions/66384210/how-te-set-a-static-ip-for-a-jetson-nano)
