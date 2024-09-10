from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from Next.js

# Create a directory to save images
UPLOAD_FOLDER = '/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        return jsonify({'message': 'File successfully uploaded', 'file_path': file_path})
    
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
    app.run(debug=True)