import torch
import cv2
import Image
import numpy as np
from torch.autograd import Variable
from autodistill_grounded_sam_2 import GroundedSAM2
from autodistill.detection import CaptionOntology
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

# Function 1: Style transfer

def SamStyler(content_image_path, style_image_path, prompt):
    content_image = tensor_load_rgbimage(content_image_path, size=512, keep_asp=True).unsqueeze(0).to(device)
    style_image = tensor_load_rgbimage(style_image_path, size=512).unsqueeze(0).to(device)
    style_image = preprocess_batch(style_image)

    # Style transfer process
    style_v = Variable(style_image)
    content_image_v = Variable(preprocess_batch(content_image))
    style_model.setTarget(style_v)
    output = style_model(content_image_v)

    # Format styled image
    styled_image = output.data[0].cpu().numpy()
    styled_image = styled_image.transpose(1, 2, 0)

    # Initialize GroundedSAM2 model
    base_model = GroundedSAM2(
        ontology=CaptionOntology(
            {
                "prompt": prompt
            }
        )
    )

    original_image = cv2.imread(content_image_path)

    # Generate mask using GroundedSAM2
    style_image_shape = styled_image.shape
    target_size = (style_image_shape[1], style_image_shape[0])
    resized_image = cv2.resize(original_image, target_size)

    results = base_model.predict(resized_image)
    mask = results.mask
    mask = np.any(mask, axis=0)

    target_size = (style_image_shape[1], style_image_shape[0])
    resized_image = cv2.resize(original_image, target_size)

    # Convert mask to 3D for combining with styled image
    mask_3d = np.stack([mask] * 3, axis=-1)

    # Combine the mask and styled image with alpha blending
    combined_image = resized_image * (1 - mask_3d) + styled_image * mask_3d

    return combined_image

# def style_transfer(content_image_path, style_image_path):
#     content_image = tensor_load_rgbimage(content_image_path, size=512, keep_asp=True).unsqueeze(0).to(device)
#     style_image = tensor_load_rgbimage(style_image_path, size=512).unsqueeze(0).to(device)
#     style_image = preprocess_batch(style_image)

#     # Style transfer process
#     style_v = Variable(style_image)
#     content_image_v = Variable(preprocess_batch(content_image))
#     style_model.setTarget(style_v)
#     output = style_model(content_image_v)

#     # Format styled image
#     styled_image = output.data[0].cpu().numpy()
#     styled_image = styled_image.transpose(1, 2, 0)

#     return styled_image

# # Function 2: Generate mask from prompt and content
# def generate_mask(content_image_path, prompt, styled_image):
#     original_image = cv2.imread(content_image_path)

#     # Initialize GroundedSAM2 model
#     base_model = GroundedSAM2(
#         ontology=CaptionOntology(
#             {
#                 "prompt": prompt
#             }
#         )
#     )

#     # Generate mask using GroundedSAM2
#     style_image_shape = styled_image.shape
#     target_size = (style_image_shape[1], style_image_shape[0])
#     resized_image = cv2.resize(original_image, target_size)

#     results = base_model.predict(resized_image)
#     mask = results.mask
#     mask = np.any(mask, axis=0)


#     return mask

# # Function 3: Combine content, styled image, and mask
# def combine_images(content_image_path, styled_image, mask, alpha=1):
#     original_image = cv2.imread(content_image_path)
#     style_image_shape = styled_image.shape
#     target_size = (style_image_shape[1], style_image_shape[0])
#     resized_image = cv2.resize(original_image, target_size)

#     # Convert mask to 3D for combining with styled image
#     mask_3d = np.stack([mask] * 3, axis=-1)

#     # Combine the mask and styled image with alpha blending
#     combined_image = resized_image * (1 - mask_3d * alpha) + styled_image * mask_3d * alpha

#     return combined_image
