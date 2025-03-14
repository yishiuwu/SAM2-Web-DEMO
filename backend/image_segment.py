import os
import numpy as np
import torch
import matplotlib.pyplot as plt
import cv2
from PIL import Image
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor

# sam2_checkpoint = "sam2.1_hiera_large.pt"
# model_cfg = "configs/sam2.1/sam2.1_hiera_l.yaml"

sam2_checkpoint = "sam2.1_hiera_base_plus.pt"
model_cfg = "configs/sam2.1/sam2.1_hiera_b+.yaml"

device = torch.device("cuda")

sam2_model = build_sam2(model_cfg, sam2_checkpoint, device=device)
# sam2_model = ...

predictor = SAM2ImagePredictor(sam2_model)
# predictor = ...


def show_mask(mask, ax, random_color=False, borders = True):
    if random_color:
        color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
    else:
        color = np.array([30/255, 144/255, 255/255, 0.6])
    h, w = mask.shape[-2:]
    mask = mask.astype(np.uint8)
    mask_image =  mask.reshape(h, w, 1) * color.reshape(1, 1, -1)
    if borders:
        import cv2
        contours, _ = cv2.findContours(mask,cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE) 
        # Try to smooth contours
        contours = [cv2.approxPolyDP(contour, epsilon=0.01, closed=True) for contour in contours]
        mask_image = cv2.drawContours(mask_image, contours, -1, (1, 1, 1, 0.5), thickness=2) 
    ax.imshow(mask_image)

def show_points(coords, labels, ax, marker_size=375):
    pos_points = coords[labels==1]
    neg_points = coords[labels==0]
    ax.scatter(pos_points[:, 0], pos_points[:, 1], color='green', marker='*', s=marker_size, edgecolor='white', linewidth=1.25)
    ax.scatter(neg_points[:, 0], neg_points[:, 1], color='red', marker='*', s=marker_size, edgecolor='white', linewidth=1.25)   

def show_box(box, ax):
    x0, y0 = box[0], box[1]
    w, h = box[2] - box[0], box[3] - box[1]
    ax.add_patch(plt.Rectangle((x0, y0), w, h, edgecolor='green', facecolor=(0, 0, 0, 0), lw=2))    

def show_masks(image, masks, scores, point_coords=None, box_coords=None, input_labels=None, borders=True):
    for i, (mask, score) in enumerate(zip(masks, scores)):
        plt.figure(figsize=(10, 10))
        plt.imshow(image)
        show_mask(mask, plt.gca(), borders=borders)
        if point_coords is not None:
            assert input_labels is not None
            show_points(point_coords, input_labels, plt.gca())
        if box_coords is not None:
            # boxes
            show_box(box_coords, plt.gca())
        if len(scores) > 1:
            plt.title(f"Mask {i+1}, Score: {score:.3f}", fontsize=18)
        plt.axis('off')
        plt.show()

def make_embedding(image_path):
    image = Image.open(image_path)
    image = np.array(image.convert("RGB"))

    predictor.set_image(image)

    save_data = {
        "_features": predictor._features,
        "_is_image_set": predictor._is_image_set,
        "_orig_hw": predictor._orig_hw,
        "_is_batch": predictor._is_batch,
        "model": predictor.model,
        # "_transforms": predictor._transforms,
        "mask_threshold": predictor.mask_threshold,
    }
    # torch.save(save_data, f'{image_path}.pth')
    # predictor.save_image_embedding(f'{image_path}.pth')

    return save_data

def predict_image_mask(embedding, input_point, input_label):
    input_point = np.array(input_point)
    input_label = np.array(input_label)
    # predictor.load_image_embedding(embedding)
    # loaded_data = torch.load(embedding)
    predictor._features = embedding["_features"]
    predictor._is_image_set = embedding["_is_image_set"]
    predictor._orig_hw = embedding["_orig_hw"]
    predictor._is_batch = embedding["_is_batch"]

    masks, scores, logits = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=True,
    )
    sorted_ind = np.argsort(scores)[::-1]
    masks = masks[sorted_ind]
    scores = scores[sorted_ind]
    logits = logits[sorted_ind]
    return masks, scores, logits

def predict_mask(embedding, input_point, input_label, mask_input=[]):
    input_point = np.array(input_point)
    input_label = np.array(input_label)
    predictor._features = embedding["_features"]
    predictor._is_image_set = embedding["_is_image_set"]
    predictor._orig_hw = embedding["_orig_hw"]
    predictor._is_batch = embedding["_is_batch"]
    predictor.model = embedding["model"]
    # predictor._transforms = embedding["_transforms"]
    predictor.mask_threshold = embedding["mask_threshold"]

    if isinstance(mask_input, np.ndarray):
        masks, scores, logits = predictor.predict(
            point_coords=input_point,
            point_labels=input_label,
            mask_input = mask_input[None, :, :],
            multimask_output=False,
        )
        masks = masks[0]
        scores = scores[0]
        logits = logits[0]
    else:
    # predictor.load_image_embedding(embedding)
    # loaded_data = torch.load(embedding)    
        masks, scores, logits = predictor.predict(
            point_coords=input_point,
            point_labels=input_label,
            multimask_output=True,
        )
        sorted_ind = np.argsort(scores)[::-1]
        masks = masks[np.argmax(scores)]
        scores = scores[np.argmax(scores)]
        logits = logits[np.argmax(scores)]
    return masks, scores, logits

def showmask2img(mask, image, color=[0, 255, 0]):
    masked_img = image.copy()
    masked_img[(mask!=0)] = color

    masked_img_w = cv2.addWeighted(masked_img, 0.3, image, 0.7, 0, masked_img)

    return masked_img_w