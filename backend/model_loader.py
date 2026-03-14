import tensorflow as tf
from huggingface_hub import hf_hub_download

# repo huggingface
REPO_ID = "abdulrosyid/krenova"

# nama file model di repo
MODEL_FILENAME = "best_model.keras"

try:
    # download model dari huggingface
    model_path = hf_hub_download(
        repo_id=REPO_ID,
        filename=MODEL_FILENAME
    )

    # load model tensorflow
    model = tf.keras.models.load_model(model_path)

    print(f"[model_loader] model loaded successfully from {model_path}")

except Exception as exc:
    model = None
    print(f"[model_loader] failed to load model from HuggingFace: {exc}")