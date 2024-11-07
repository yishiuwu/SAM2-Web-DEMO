from flask import Flask, request, jsonify, send_from_directory, session, send_file, abort
from flask_cors import CORS
from flask_redis import FlaskRedis
import os
import image_segment
import torch
import io
import numpy as np
import cv2
import pickle
from io import BytesIO
# from PIL import Image
# import base64

from shutil import copy
from style import resize_image
from tensor_image import tensor_load_rgbimage, preprocess_batch
from model import Net
from torch.autograd import Variable

app = Flask(__name__)

# Details on the Secret Key: https://flask.palletsprojects.com/en/3.0.x/config/#SECRET_KEY
# NOTE: The secret key is used to cryptographically-sign the cookies used for storing
#       the session identifier.

secret_key = os.urandom(24).hex()
app.secret_key = secret_key

# Configure Redis for storing the session data on the server-side
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['REDIS_URL'] = 'redis://127.0.0.1:6379'


# Create a directory to save images
UPLOAD_FOLDER = '/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
# Create a directory to save processed images
PROCESSED_FOLDER = '/processed'
if not os.path.exists(PROCESSED_FOLDER):
    os.makedirs(PROCESSED_FOLDER)
# Create a directory to save sam embeds
EMBEDDINGS_FOLDER = '/embedings'
if not os.path.exists(EMBEDDINGS_FOLDER):
    os.makedirs(EMBEDDINGS_FOLDER)
# Create a directory to save style images
STYLES_FOLDER = '/image'
if not os.path.exists(STYLES_FOLDER):
    os.makedirs(STYLES_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['EMBEDDINGS_FOLDER'] = EMBEDDINGS_FOLDER
app.config['STYLES_FOLDER'] = STYLES_FOLDER

app.config.from_object(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})
redis = FlaskRedis(app)

# Create and initialize the Flask-Session object AFTER `app` has been configured

@app.route('/image/<path:filename>')
def serve_style(filename):
    return send_from_directory(app.config['STYLES_FOLDER'], filename)

@app.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/processed/<filename>')
def serve_processed(filename):
    return send_from_directory(app.config['PROCESSED_FOLDER'], filename)

def serialize_embedding(embedding):
    torch.save(embedding, EMBEDDINGS_FOLDER + '/test.pt')  # Save embedding to buffer
    redis.set('predictor', EMBEDDINGS_FOLDER + '/test.pt')

def deserialize_embedding():
    stored_embedding = redis.get('predictor').decode('utf-8')

    return torch.load(stored_embedding)

def retrieve_points():
    points = redis.get('points')
    if (points is None):
        return []
    points = eval(points)

    return points

def save_points(points):
    redis.set('points', points.__str__())

def retrieve_labels():
    labels = redis.get('labels')
    if (labels is None):
        return []
    labels = eval(labels)
    return labels

def save_labels(labels):
    redis.set('labels', labels.__str__())

def save_file(filename):
    redis.set('filename', filename.__str__())

def get_filename():
    return redis.get('filename').decode('utf-8')

def save_data(key, data):
    redis.set(key, data.__str__())

def get_data(key):
    return redis.get(key).decode('utf-8')

def save_nparray(key, arr):
    arr_binary = pickle.dumps(arr)
    redis.set(f'{key}', arr_binary)

def retrieve_nparray(key):
    stored_data = redis.get(key)
    serialized_arr = pickle.loads(stored_data)

    return serialized_arr

@app.route('/api/upload_image', methods=['POST', 'GET'])
def upload_image():
    if request.method == 'POST':
        if 'image' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['image']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if 'isStyle' in request.values:
            dest = UPLOAD_FOLDER if request.values['isStyle'] == 'false' else STYLES_FOLDER

        if file:
            file_path = os.path.join(dest, file.filename)
            file.save(file_path)
            if dest == UPLOAD_FOLDER:
                save_file(filename = file.filename)
                resize_image(file_path)
                embedding = image_segment.make_embedding(file_path)
                serialize_embedding(embedding)
                save_nparray('points',[])
                save_labels([])
                redis.delete('maskId')
                redis.delete('style_path')
                save_nparray('logits',[])
            
            return jsonify({'message': 'File successfully uploaded', 'file_path': file_path})
    if request.method == 'GET':
        redis.incr('test')
        return f'<h1>/api/upload_image access seccess</h1>\
            <p>redis test: {redis.get("test")}</p>'

@app.route('/api/generate_mask', methods=['POST'])
def generate_mask():
    if request.method == 'POST':
        if 'point' not in request.values:
            return jsonify({'error': 'No given point'})
        if 'label' not in request.values:
            return jsonify({'error': 'No given label'})
        
        point = request.values['point']
        point = point.split(' ')
        point = [float(i) for i in point]
        label = int(request.values['label'])
        embedding = deserialize_embedding()
        points = retrieve_nparray('points')
        points.append(point)
        save_nparray('points', points)
        labels = retrieve_labels()
        labels.append(label)
        save_labels(labels)
        mask_input = retrieve_nparray('logits')

        # generate mask
        masks, _, logits = image_segment.predict_mask(embedding, points, labels, mask_input)
        img = cv2.imread(os.path.join(UPLOAD_FOLDER, get_filename()))
        masked_img_pth = os.path.join(PROCESSED_FOLDER, 'masked_'+get_filename())
        cv2.imwrite(masked_img_pth, image_segment.showmask2img(masks, img, [0, 0, 255]))

        save_nparray('logits', logits)
        save_nparray('masks', masks)
        
        return jsonify({'message': 'Successfully retrieve embedding', 'masked_img_pth': masked_img_pth})

@app.route('/api/clear_mask', methods=['POST'])
def clear_mask():
    if request.method == 'POST':
        save_nparray('points',[])
        save_labels([])
        save_nparray('logits', [])
        # clear mask

        # return cleard image
        masked_img_pth = os.path.join(UPLOAD_FOLDER, get_filename())
        return jsonify({'message': 'Successfully clear mask', 'masked_img_pth': masked_img_pth})

@app.route('/api/apply_style', methods=['POST'])
def apply_style():
    try:
        data = request.json
        style_image = data.get('style_image')

        if not style_image:
            return jsonify({"error": "No style image provided"}), 400

        style_img_path = STYLES_FOLDER + style_image
        resize_file_path = os.path.join(UPLOAD_FOLDER, get_filename())
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        content_image = tensor_load_rgbimage(resize_file_path, size=512, keep_asp=True).unsqueeze(0).to(device)

        # style_img_path = os.path.join("./image" + get_style())
        style_image = tensor_load_rgbimage(style_img_path, size=512).unsqueeze(0).to(device)
        style_image = preprocess_batch(style_image)

        # Style transfer process
        style_v = Variable(style_image)
        content_image_v = Variable(preprocess_batch(content_image))
        style_model.setTarget(style_v)
        output = style_model(content_image_v)

        # Format styled image
        styled_image = output.data[0].cpu().numpy()
        styled_image = styled_image.transpose(1, 2, 0)
        styled_image = cv2.resize(styled_image, (content_image.shape[3], content_image.shape[2]))
        masks = retrieve_nparray('masks')

        if redis.exists('style_path'):
            path = get_data('style_path')
            original_image = cv2.imread(path)
        else:
            original_image = cv2.imread(resize_file_path)
            
        combined_image = original_image.copy()
        combined_image = np.where(masks[..., None] != 0, styled_image, original_image)
        if redis.exists('maskId'):
            maskId = get_data('maskId')
        else:
            maskId = 0

        file_path = os.path.join(UPLOAD_FOLDER, f"{maskId}processed" + get_filename())

        save_data('style_path', file_path)
        cv2.imwrite(file_path, combined_image)

        return jsonify({'message': 'File successfully combined', 'file_path': file_path})

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/save_mask', methods=['POST'])
def save_mask():
    try:
        if redis.exists('maskId'):
            maskId = int(get_data('maskId'))
        else:
            maskId = 0

        masks = retrieve_nparray('masks')
        save_nparray(f'masks{maskId}', masks)
        save_data('maskId', maskId+1)

        return jsonify({'message': f'Mask successfully saved {maskId}', 'maskId': f'{maskId}'})

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/select_mask', methods=['POST'])
def select_mask():
    try:
        data = request.json
        maskSelect = data.get('id')
        save_data('maskSelect', maskSelect)
        current = retrieve_nparray(f'masks{maskSelect}')
        save_nparray('masks', current)

        return jsonify({'message': 'Mask successfully selected'})


    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # 初始化模型
    style_model = Net(ngf=128).to(device)
    # 加載預訓練模型的字典
    model_dict = torch.load('21styles.model', map_location=device)
    # 創建副本並刪除 'running_mean' 和 'running_var'
    model_dict_clone = model_dict.copy()
    for key in list(model_dict_clone.keys()):
        if key.endswith(('running_mean', 'running_var')):
            del model_dict[key]
    style_model.load_state_dict(model_dict, strict=False)

    if len(os.listdir(STYLES_FOLDER)) == 0:
        style_list = os.listdir('./image')
        for s in style_list:
            copy(os.path.join('./image', s), STYLES_FOLDER)

    app.run(host="0.0.0.0", port=5000, debug=True)