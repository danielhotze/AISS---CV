# Application

This project uses [Angular](https://angular.dev/overview) version 18.0.5. <br><br>
The application uses an [Electron](https://www.electronjs.org/) application. <br>
Using Electron comes with the advantage of being cross-platform by default, compatible with macOS, Windows, and Linux. <br>
By embedding Chromium and Node.js, Electron enables web developers to create desktop applications with a native graphical user interface without the need for a native codebase.

## Requirements
The following requirements must be satisfied to be able to (locally) run this application.
- Install Node.js and npm. <br> We recommend to use [nvm](https://www.freecodecamp.org/news/how-to-update-node-and-npm-to-the-latest-version/) for handling this installation.
- Go to the terminal and run `npm install` to install all necessary node modules that are required to run the app.
- Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) for the database that will hold our device and incident data. <br>
(Make sure that MongoDB is running on the standard port :227017).
- [Optional]: During development, 'MongoDB Atlas' can be very helpful to get an easy access to the data in the database.
- [Optional]: During development, [Postman](https://www.postman.com/downloads/?utm_source=postman-home) can be very helpful to create HTTP-Requests that can mock the behavior of the Jetson Nano Devices.

After completing these steps, you should be ready to start the application. <br>
Run `npm run electron` to locally start the application or run `npm run make` to create a distributable for your operating system.

# Architecture
Since one of the main benefits of the Jetson Nano Device is that it can run machine learning models locally, we challenged ourself to find and implement a use case that also does not need any internet to function. <br><br>
As depicted in the overview image in the main [README.md](../README.md), the idea was to build a [model](../training/README.md) for detecting PPE-equiment violations on construction sites which are prone to have poor internet connection. <br>
We would then run that model on [Jetson Nano Devices](../jetson/README.md) on the construction site which have access to some camera feed. When the device detects a violation, it would send the violation data with HTTP-Requests over a local area network. <br> <br>
In some king of safety booth, there is one main computer that receives and persists the data from all the detection devices using this Electron application. <br>
This applications consists of an [Electron frame](#electron) that runs the [Express Server](#server) as a sub-process and inserts the [Angular Frontend](#frontend) into the desktop application. <br>
The server provides several HTTP endpoints that allow the Jetson devices to send their detection results to the database and enables the Frontend to access and modify that data.

![Architecture Sketch](../images/architecture.png)

## Electron
As stated before, Electron is responsible for actually creating the (native) desktop application which contains the Angular Frontend and runs the Express Server. <br>

The primary code for the Electron setup is located in the [main.js](./main.js) file. <br>
The `createWindow()` method can be used to define the size of the desktop app window, set app icons and define the Frontend application that is displayed inside the app window. <br>

`app.whenReady()` is used to define actions that should be executed during the application startup, such as starting the Server as a [utilityProcess](https://www.electronjs.org/docs/latest/api/utility-process) which is Electron's version of a [childProcess](https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options). Such a `utilityProcess` enables us to spawn a subprocess for the Server code that can run separately and communicates with the parent process using the `process.on(...)` and `process.postMessage(...)` syntax. <br>

`app.on('window-all-closed', ...)` is an Electron event listener that gets executed during the app shutdown process after the desktop app window is closed. <br>
We use this event to initiate a graceful shutdown of the Server utilityProcess and Database connection and then quit the app.

## Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Frontend
![overview page](../images/screenshot_app_overview.png)

![incidents page](../images/screenshot_app_incidents.png)

![devices page](../images/screenshot_app_devices.png)

# Deployment

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publish
Run ...
