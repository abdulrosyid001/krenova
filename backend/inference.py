import cv2
import numpy as np
import time
from typing import Dict

try:
    import dlib
    DLLIB_AVAILABLE = True
except ImportError:
    dlib = None
    DLLIB_AVAILABLE = False

from feature_extraction import compute_EAR, compute_MAR, compute_perclos, compute_brow_ratio
from preprocessing import preprocess_image
from utils import decode_base64_image
from model_loader import model

FACE_LANDMARK_MODEL = "shape_predictor_68_face_landmarks.dat"
if DLLIB_AVAILABLE:
    face_detector = dlib.get_frontal_face_detector()
    try:
        shape_predictor = dlib.shape_predictor(FACE_LANDMARK_MODEL)
    except Exception:
        shape_predictor = None
else:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    shape_predictor = None

LEFT_EYE_IDX = [36, 37, 38, 39, 40, 41]
RIGHT_EYE_IDX = [42, 43, 44, 45, 46, 47]
MOUTH_IDX = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]
LEFT_BROW_IDX = [17, 18, 19, 20, 21]
RIGHT_BROW_IDX = [22, 23, 24, 25, 26]


def _shape_to_list(shape) -> list:
    return [(shape.part(i).x, shape.part(i).y) for i in range(68)]


def _extract_eye_points(landmarks, indices):
    return [landmarks[i] for i in indices]


def _extract_mouth_points(landmarks):
    return [landmarks[i] for i in [48, 51, 57, 54, 60, 64, 66]]


def predict_drowsiness(frame_b64: str) -> Dict:
    start_time = time.time()
    frame = decode_base64_image(frame_b64)
    if frame is None:
        return {
            "drowsy": False,
            "confidence": 0.0,
            "ear": 0.0,
            "mar": 0.0,
            "perclos": 0.0,
            "face_detected": False,
            "time_ms": 0.0,
        }

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    if DLLIB_AVAILABLE and shape_predictor is not None:
        faces = face_detector(gray, 1)
        if len(faces) == 0:
            return {
                "drowsy": False,
                "confidence": 0.0,
                "ear": 0.0,
                "mar": 0.0,
                "perclos": 0.0,
                "face_detected": False,
                "time_ms": (time.time() - start_time) * 1000,
            }
        face = faces[0]
        shape = shape_predictor(gray, face)
        landmarks = _shape_to_list(shape)
        left_eye = _extract_eye_points(landmarks, LEFT_EYE_IDX)
        right_eye = _extract_eye_points(landmarks, RIGHT_EYE_IDX)
        mouth = _extract_mouth_points(landmarks)

        ear = (compute_EAR(left_eye) + compute_EAR(right_eye)) / 2.0
        mar = compute_MAR(mouth)
        perclos = compute_perclos(ear)
        brow = compute_brow_ratio(LEFT_BROW_IDX, RIGHT_BROW_IDX, landmarks)
        face_flag = 1.0

        y1, y2 = max(face.top(), 0), min(face.bottom(), frame.shape[0])
        x1, x2 = max(face.left(), 0), min(face.right(), frame.shape[1])
        face_roi = frame[y1:y2, x1:x2]
        if face_roi.size == 0:
            face_roi = frame
    else:
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))
        if len(faces) == 0:
            return {
                "drowsy": False,
                "confidence": 0.0,
                "ear": 0.0,
                "mar": 0.0,
                "perclos": 0.0,
                "face_detected": False,
                "time_ms": (time.time() - start_time) * 1000,
            }
        x, y, w, h = faces[0]
        face_roi = frame[y:y+h, x:x+w]
        ear = 0.25
        mar = 0.35
        perclos = 0.12
        brow = 0.5
        face_flag = 1.0

    processed = preprocess_image(face_roi)
    feature_vector = np.array([[ear, mar, perclos, brow, brow, face_flag]], dtype=np.float32)

    if model is None:
        raise RuntimeError("Model not loaded")

    preds = model.predict([processed, feature_vector], verbose=0)
    if isinstance(preds, list) and len(preds) > 0:
        pred = preds[0]
    else:
        pred = preds
    if hasattr(pred, '__len__'):
        confidence = float(pred[0]) if len(pred) > 0 else 0.0
    else:
        confidence = float(pred)

    drowsy = bool(confidence >= 0.5)
    elapsed_ms = (time.time() - start_time) * 1000

    return {
        "drowsy": drowsy,
        "confidence": round(confidence, 3),
        "ear": round(ear, 4),
        "mar": round(mar, 4),
        "perclos": round(perclos, 4),
        "face_detected": True,
        "time_ms": round(elapsed_ms, 2),
    }
