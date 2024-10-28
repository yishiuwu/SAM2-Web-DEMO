import torch
import cv2
from PIL import Image
import numpy as np
from torch.autograd import Variable
# from autodistill_grounded_sam_2 import GroundedSAM2
# from autodistill.detection import CaptionOntology
from tensor_image import tensor_load_rgbimage, preprocess_batch
from model import Net

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

style_model = Net(ngf=128).to(device)
model_dict = torch.load('21styles.model', map_location=device)
model_dict_clone = model_dict.copy()
for key, value in model_dict_clone.items():
    if key.endswith(('running_mean', 'running_var')):
        del model_dict[key]
style_model.load_state_dict(model_dict, False)

def resize_image(image_path, target_width=512):
    with Image.open(image_path) as img:
        width_percent = (target_width / float(img.size[0]))
        target_height = int((float(img.size[1]) * float(width_percent)))
        img = img.resize((target_width, target_height), Image.LANCZOS)
        img.save(image_path)  # 覆蓋原始圖片
    return image_path

def style_image(content_img_pth, style_img_pth):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    content_image = tensor_load_rgbimage(content_img_pth, size=512, keep_asp=True).unsqueeze(0).to(device)

    resize_height = content_image.shape[2]  # 高度為 content_image 的高度
    resize_width = content_image.shape[3]  

    # style_img_path = os.path.join("./image" + get_style())
    style_image = tensor_load_rgbimage(style_img_pth, size=512).unsqueeze(0).to(device)
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
    return styled_image