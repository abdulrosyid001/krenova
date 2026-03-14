import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from inference import predict_drowsiness
from model_loader import model

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s'
)

logger = logging.getLogger("drowsiness-api")

app = FastAPI(title="Driver Drowsiness Detection API")


class PredictRequest(BaseModel):
    image: str


@app.on_event("startup")
async def startup_event():
    """
    Ensure model is loaded when the API starts.
    """
    if model is None:
        logger.error("Model failed to load from HuggingFace")
    else:
        logger.info("Model loaded successfully and API is ready")


@app.get("/")
async def root():
    return {
        "message": "Driver Drowsiness Detection API",
        "model_loaded": model is not None
    }


@app.post("/predict")
async def predict(payload: PredictRequest):

    if model is None:
        raise HTTPException(
            status_code=500,
            detail="Model not loaded"
        )

    try:
        result = predict_drowsiness(payload.image)

        logger.info(
            f"Prediction result: "
            f"face_detected={result.get('face_detected')}, "
            f"drowsy={result.get('drowsy')}, "
            f"time_ms={result.get('time_ms')}"
        )

        return result

    except Exception as exc:
        logger.error(f"Prediction exception: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Failed to process this frame"
        )