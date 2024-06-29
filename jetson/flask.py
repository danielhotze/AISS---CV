from flask import Flask, request

# The flask server on the python is primarily for receiving the IP address of the server in the network.
# The server will send a post request to the 'ping' route to share its' IP with the saved devices.

# It would probably also be possible to create a 'startDetection' route which starts the detection code but we should
# wait with that until everything else works I think

# will run on port 5000 by standard?
app = Flask(__name__)

# Either incorporate the Flask code into the main code or make SERVER_IP and DEVICE_ID accessible to the main detection logic
# and especially the server requests
SERVER_IP = None
DEVICE_ID = None

@app.route('/ping', methods=['POST'])
def ping():
  data = request.json
  SERVER_IP = data.serverIP
  DEVICE_ID = data.deviceID
  return {'deviceID': DEVICE_ID, 'status': 'active'}, 201