import tensorflow as tf
import os

MODEL_PATH = os.getenv("DD_MODEL_PATH", "model/best_model.keras")

try:
    model = tf.keras.models.load_model(MODEL_PATH)
except Exception as exc:
    model = None
    print(f"[model_loader] failed to load model at {MODEL_PATH}: {exc}")

