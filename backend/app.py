from flask import Flask, request, jsonify, send_from_directory, session, send_file, abort
from flask_cors import CORS
# from flask_socketio import SocketIO
from flask_redis import FlaskRedis
import os
import image_segment
import torch
import io
import numpy as np
import cv2
import pickle
from io import BytesIO
from PIL import Image
import base64

from style import resize_image
from tensor_image import tensor_load_rgbimage, preprocess_batch
from model import Net
from torch.autograd import Variable

app = Flask(__name__)

# Details on the Secret Key: https://flask.palletsprojects.com/en/3.0.x/config/#SECRET_KEY
# NOTE: The secret key is used to cryptographically-sign the cookies used for storing
#       the session identifier.
secret_key = os.urandom(24).hex()
# app.secret_key = os.getenv('SECRET_KEY', default='BAD_SECRET_KEY')
app.secret_key = secret_key
# print(f"secret key is: {app.secret_key}")

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
STYLES_FOLDER = './image'
if not os.path.exists(STYLES_FOLDER):
    os.makedirs(STYLES_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['EMBEDDINGS_FOLDER'] = EMBEDDINGS_FOLDER
app.config['STYLES_FOLDER'] = STYLES_FOLDER

app.config.from_object(__name__)
# socketio = SocketIO(app, cors_allowed_origins='*')
# CORS(app)  # Enable CORS to allow requests from Next.js
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})
redis = FlaskRedis(app)
redis.set('test', 0)

# Create and initialize the Flask-Session object AFTER `app` has been configured
# server_session = Session(app)

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
    byte_stream = io.BytesIO()
    # torch.save(embedding, byte_stream)  # Save embedding to buffer
    # print( EMBEDDINGS_FOLDER+get_filename())
    torch.save(embedding, EMBEDDINGS_FOLDER + '/test.pt')  # Save embedding to buffer
    # byte_stream.seek(0)
    # redis.set('predictor', byte_stream.getvalue())
    redis.set('predictor', EMBEDDINGS_FOLDER + '/test.pt')
    # return 

def deserialize_embedding():
    stored_embedding = redis.get('predictor').decode('utf-8')
    # byte_stream = io.BytesIO(stored_embedding)
    # byte_stream.seek(0)
    # return torch.load(byte_stream)
    return torch.load(stored_embedding)

def retrieve_points():
    points = redis.get('points')
    if (points is None):
        return []
    points = eval(points)
    # print(points)
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

def save_scale(widScale, heiScale):
    redis.set('widScale', widScale)
    redis.set('heiScale', heiScale)

def retrieve_scale():
    widScale = redis.get('widScale')
    heiScale = redis.get('heiScale')
    
    # 轉換為浮點數，因為 redis.get() 返回的是 bytes
    if widScale is not None and heiScale is not None:
        widScale = float(widScale)
        heiScale = float(heiScale)
    
    return widScale, heiScale

def save_file(filename):
    redis.set('filename', filename.__str__())

def get_filename():
    return redis.get('filename').decode('utf-8')

def set_style(style):
    redis.set('style', style.__str__())

def get_style():
    return redis.get('style').decode('utf-8')

def save_nparray(key, arr):
    arr_binary = pickle.dumps(arr)
    redis.set(f'{key}', arr_binary)
    # arr_dtype = bytearray(str(arr.dtype), 'utf-8')
    # arr_shape = bytearray(','.join([str(a) for a in arr.shape]), 'utf-8')
    # sep = bytearray('|', 'utf-8')
    # arr_bytes = arr.ravel().tobytes()
    # ser_arr = arr_dtype + sep + arr_shape + sep + arr_bytes
    # print(ser_arr)
    # redis.set(key, )

def retrieve_nparray(key):
    stored_data = redis.get(key)
    serialized_arr = pickle.loads(stored_data)
    # sep = '|'.encode('utf-8')
    # i_0 = serialized_arr.find(sep)
    # i_1 = serialized_arr.find(sep, i_0 + 1)
    # arr_dtype = serialized_arr[:i_0].decode('utf-8')
    # arr_shape = tuple([int(a) for a in serialized_arr[i_0 + 1:i_1].decode('utf-8').split(',')])
    # arr_str = serialized_arr[i_1 + 1:]
    # arr = np.frombuffer(arr_str, dtype = arr_dtype).reshape(arr_shape)
    return serialized_arr

@app.route('/api/upload_image', methods=['POST', 'GET'])
# @cross_origin(origin='http://localhost:3000', supports_credentials= True)
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
                image = cv2.imread(file_path)
                h, w, _ = image.shape
                # resize_file_path = os.path.join(UPLOAD_FOLDER,"resize_"+file.filename)
                # file.save(resize_file_path)
                resize_image(file_path)
                image = cv2.imread(file_path)
                rh, rw, _ = image.shape
                save_scale(rw/w, rh/h)
                embedding = image_segment.make_embedding(file_path)
                serialize_embedding(embedding)
                save_points([])
                save_labels([])
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
        widScale, heiScale = retrieve_scale()
        # point = [(float(point[0]) * widScale, float(point[1]) * heiScale)]
        # print(point)
        # retrieve embedding
        embedding = deserialize_embedding()
        points = retrieve_points()
        points.append(point)
        save_points(points)
        labels = retrieve_labels()
        labels.append(label)
        save_labels(labels)
        print(f"label:{labels}")
        print(f"point:{points}")

        # generate mask
        masks, scores, logits = image_segment.predict_mask(embedding, points, [0 for i in range(len(points))])

        img = cv2.imread(os.path.join(UPLOAD_FOLDER, get_filename()))
        masked_img_pth = os.path.join(PROCESSED_FOLDER, 'masked_'+get_filename())
        cv2.imwrite(masked_img_pth, image_segment.showmask2img(masks[0], img, [0, 0, 255]))
        logits = logits[np.argmax(scores), :, :]
        save_nparray('logits', logits)
        rlogits = retrieve_nparray('logits')
        # print(logits.shape, rlogits.shape)
        # print(f'logits:{logits}')
        # print(f'rlogits{rlogits}')
        # redis.set('predictor', serialize_embedding(predictor))
        return jsonify({'message': 'Successfully retrieve embedding', 'masked_img_pth': masked_img_pth})

@app.route('/api/clear_mask', methods=['POST'])
def clear_mask():
    if request.method == 'POST':
        save_points([])
        # clear mask

        return jsonify({'message': 'Successfully retrieve embedding'})

@app.route('/api/apply_style', methods=['POST'])
def apply_style():
    try:
        data = request.json
        style_image = data.get('style_image')

        if not style_image:
            return jsonify({"error": "No style image provided"}), 400

        # 根據 style_image 處理不同的風格邏輯
        if style_image == 'test1':
            # 應用 test1 風格的處理
            # set_style('style1')
            style_img_path = './image/style1.jpg'
            style_applied = "Applied style test1"
        elif style_image == 'test2':
            # 應用 test2 風格的處理
            # set_style('style2')
            style_img_path = './image/style2.jpg'
            style_applied = "Applied style test2"
        elif style_image == 'test3':
            # 應用 test3 風格的處理
            # set_style('style3')
            style_img_path = './image/style3.jpg'
            style_applied = "Applied style test3"
        elif style_image == 'test4':
            # 應用 test4 風格的處理
            # set_style('styl4')
            style_img_path = './image/style4.jpg'
            style_applied = "Applied style test4"
        else:
            # return jsonify({"error": "Invalid style selected"}), 400
            style_img_path = STYLES_FOLDER + style_image
        
        resize_file_path = os.path.join(UPLOAD_FOLDER, get_filename())
        # style_image(resize_file_path, style_image)
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        content_image = tensor_load_rgbimage(resize_file_path, size=512, keep_asp=True).unsqueeze(0).to(device)

        resize_height = content_image.shape[2]  # 高度為 content_image 的高度
        resize_width = content_image.shape[3]  

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


        embedding = deserialize_embedding()
        points = retrieve_points()
        labels = retrieve_labels()
        rlogits = retrieve_nparray('logits')
        
        if isinstance(rlogits, np.ndarray):
            masks, scores, logits = image_segment.predict_mask(embedding, points, labels, mask_input=rlogits)
        else:
            masks, scores, logits = image_segment.predict_mask(embedding, points, labels)

        save_nparray('logits', logits)

        original_image = cv2.imread(resize_file_path)

        print(f"original image shape: {original_image.shape}")
        print(f"mask shape: {masks[0].shape}")

        print(f"style image shape: {style_image.shape}")
        print(f"content image shape: {content_image.shape}")

        combined_image = original_image.copy()
        combined_image = np.where(masks[0][..., None] != 0, styled_image, original_image)
        # combined_image[masks[0]!=0,:] = styled_image[masks[0]!=0,:]
        # combined_image = original_image * (1 - masks[0]) + styled_image * masks[0]
        # 保存並返回合併的圖片結果
        file_path = os.path.join(UPLOAD_FOLDER, "processed" + get_filename())
        cv2.imwrite(file_path, combined_image)

        # 假設這裡處理了圖像風格轉換並返回結果
        # return jsonify({"message": style_applied}), 200
        return jsonify({'message': 'File successfully combined', 'file_path': file_path})

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

# operation when receive text prompt
@app.route('/api/prompt', methods=['POST'])
def text_prompt():
    if 'prompt' not in request.values:
        return jsonify({'error': 'No text enter'}), 400
    
    text = request.values['prompt']

    if text:
        # SamStyler()
        # do some prompt operation and save mask data

        return jsonify({'message': 'Prompt successfully received', 'prompt': text})


# 示例 mask 圖片數據
MASK_IMAGES = {
    1: np.random.rand(256, 256, 3) * 255,
    2: np.random.rand(256, 256, 3) * 255,
    3: np.random.rand(256, 256, 3) * 255,
    4: np.random.rand(256, 256, 3) * 255,
}

# 獲取指定 mask 圖片和 ID
@app.route('/api/get_mask_image/<int:mask_id>', methods=['GET'])
def get_mask_image(mask_id):
    if mask_id in MASK_IMAGES:
        # 將 mask 數據轉換為圖片
        mask_image = Image.fromarray(MASK_IMAGES[mask_id].astype('uint8'))
        img_io = BytesIO()
        mask_image.save(img_io, 'PNG')
        img_io.seek(0)
        # 將圖片轉為 Base64 字符串
        img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')
        
        # 將圖片和 ID 一起返回
        return jsonify({
            "maskId": mask_id,
            "image": img_base64
        }), 200
    else:
        return abort(404, description="Mask not found")

# 路由 2: 選擇當前正在編輯的 mask
@app.route('/api/select_mask', methods=['POST'])
def select_mask():
    global current_selected_mask
    data = request.json
    mask_id = data.get('maskId')

    if mask_id in MASK_IMAGES:
        current_selected_mask = mask_id  # 更新當前選中的 mask ID
        return jsonify({"message": f"Mask {mask_id} selected for editing."}), 200
    else:
        return jsonify({"error": "Invalid mask ID"}), 400

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

    app.run(host="0.0.0.0", port=5000, debug=True)