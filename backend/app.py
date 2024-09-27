from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS, cross_origin
# from flask_socketio import SocketIO
from flask_redis import FlaskRedis
import os

app = Flask(__name__)

# Details on the Secret Key: https://flask.palletsprojects.com/en/3.0.x/config/#SECRET_KEY
# NOTE: The secret key is used to cryptographically-sign the cookies used for storing
#       the session identifier.
secret_key = os.urandom(24).hex()
# app.secret_key = os.getenv('SECRET_KEY', default='BAD_SECRET_KEY')
app.secret_key = secret_key
print(f"secret key is: {app.secret_key}")

# Configure Redis for storing the session data on the server-side
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['REDIS_URL'] = 'redis://127.0.0.1:6379'


# Create a directory to save images
UPLOAD_FOLDER = '/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config.from_object(__name__)
# socketio = SocketIO(app, cors_allowed_origins='*')
# CORS(app)  # Enable CORS to allow requests from Next.js
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})
redis = FlaskRedis(app)
redis.set('test', 0)

# Create and initialize the Flask-Session object AFTER `app` has been configured
# server_session = Session(app)

@app.route('/api/upload_image', methods=['POST', 'GET'])
# @cross_origin(origin='http://localhost:3000', supports_credentials= True)
def upload_image():
    if request.method == 'POST':
        if 'image' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['image']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file:
            file_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(file_path)
            # session['image_path'] = file_path # uncomment this line would cause cors error. reason not found yet
            return jsonify({'message': 'File successfully uploaded', 'file_path': file_path})
    # session['test'] = "test session success!"
    # print(server_session.)
    if request.method == 'GET':
        redis.incr('test')
        return f'<h1>/api/upload_image access seccess</h1>\
            <p>redis test: {redis.get("test")}</p>'
    
# operation when receive text prompt
@app.route('/api/prompt', methods=['POST'])
def text_prompt():
    if 'prompt' not in request.values:
        return jsonify({'error': 'No text enter'}), 400
    
    text = request.values['prompt']

    if text:
        # do some prompt operation and save mask data

        return jsonify({'message': 'Prompt successfully received', 'prompt': text})

@app.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)