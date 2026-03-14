import base64
import cv2
import numpy as np


def decode_base64_image(image_b64: str) -> np.ndarray:
    header_split = image_b64.split(",", 1)
    if len(header_split) == 2:
        image_b64 = header_split[1]
    image_data = base64.b64decode(image_b64)
    np_arr = np.frombuffer(image_data, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return frame

