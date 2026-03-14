import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from inference import predict_drowsiness

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s - %(message)s')
logger = logging.getLogger("drowsiness-api")

app = FastAPI(title="Driver Drowsiness Detection API")


class PredictRequest(BaseModel):
    image: str


@app.get("/")
async def root():
    return {"message": "Driver Drowsiness Detection API"}


@app.post("/predict")
async def predict(payload: PredictRequest):
    try:
        result = predict_drowsiness(payload.image)
        logger.info(f"Prediction result: face_detected={result.get('face_detected')}, drowsy={result.get('drowsy')}, time_ms={result.get('time_ms')}")
        return result
    except Exception as exc:
        logger.error(f"Prediction exception: {exc}")
        raise HTTPException(status_code=500, detail="Failed to process this frame")

