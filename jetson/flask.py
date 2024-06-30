from flask import Flask, request

# The flask server on the python is primarily for receiving the IP address of the server in the network.
# The server will send a get request to the 'ping' route to share its' IP with the saved devices and to 
# check if the device is still running

# It would probably also be possible to create a 'startDetection' route which starts the detection code but we should
# wait with that until everything else works I think

# will run on port 5000 by standard?
app = Flask(__name__)

# Either incorporate the Flask code into the main code or make SERVER_IP and DEVICE_ID accessible to the main detection logic
# and especially the server requests
SERVER_IP = None
DEVICE_ID = None

# GET - The server will periodically (maybe once a minute?) send a GET request just to check if the device is still running
# Here, we can just extract the server-IP from the request object
@app.get('/ping')
def ping():
  if request.headers.getlist("X-Forwarded-For"):
    SERVER_IP = request.headers.getlist("X-Forwarded-For")[0]
  else:
    SERVER_IP = request.remote_addr
  return '', 200

# make sure that flask is running on port 5000
if __name__ == '__main__':
  app.run(host='0.0.0.0', port=5000)