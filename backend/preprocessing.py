import cv2
import numpy as np

TARGET_SIZE = (224, 224)


def preprocess_image(image: np.ndarray) -> np.ndarray:
    """Preprocess one face image for model inference."""
    if image is None or image.size == 0:
        raise ValueError("Empty image passed to preprocess_image")

    face_resized = cv2.resize(image, TARGET_SIZE)
    face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
    face_norm = face_rgb.astype(np.float32) / 255.0
    return np.expand_dims(face_norm, axis=0)

